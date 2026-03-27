// WebLLM Scheduler — BEAM-like time-slicing for inference requests
// N polecats share 1 engine via priority queue + token budgets

import { InferenceRequest, InferencePriority, InferenceStatus, PID } from '../otp/types';
import { ets } from '../otp/ets';
import { pubsub } from '../otp/pubsub';
import { webllmEngine } from './engine';

let requestCounter = 0;

interface SchedulerState {
  queueDepth: number;
  activeRequest: string | null;
  activePolecatPid: PID | null;
  totalProcessed: number;
  totalCancelled: number;
  avgWaitTimeMs: number;
}

class InferenceScheduler {
  private queue: InferenceRequest[] = [];
  private activeRequest: InferenceRequest | null = null;
  private abortController: AbortController | null = null;
  private processing = false;
  private stallTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private stallTimeoutMs = 30000;
  private waitTimes: number[] = [];
  private totalProcessed = 0;
  private totalCancelled = 0;
  private stateCallbacks: Set<(state: SchedulerState) => void> = new Set();

  constructor() {
    // ETS table for scheduler state
    ets.new('scheduler');

    // Listen for preemption from Mayor
    pubsub.subscribe('scheduler:preempt', (data: { requestId: string }) => {
      this.bumpPriority(data.requestId, 'escalated');
    });

    pubsub.subscribe('scheduler:cancel', (data: { requestId: string }) => {
      this.cancelRequest(data.requestId);
    });
  }

  enqueue(params: {
    beadId: string;
    polecatPid: PID;
    prompt: string;
    priority?: InferencePriority;
    maxTokensPerSlice?: number;
    onToken: (token: string) => void;
    onComplete: (output: string) => void;
    onError: (error: Error) => void;
  }): string {
    const id = `req_${++requestCounter}`;
    const request: InferenceRequest = {
      id,
      beadId: params.beadId,
      polecatPid: params.polecatPid,
      prompt: params.prompt,
      priority: params.priority || 'normal',
      maxTokensPerSlice: params.maxTokensPerSlice || 128,
      status: 'queued',
      tokensGenerated: 0,
      partialOutput: '',
      onToken: params.onToken,
      onComplete: params.onComplete,
      onError: params.onError,
      createdAt: Date.now(),
    };

    this.queue.push(request);
    this.sortQueue();
    this.updateState();

    pubsub.broadcast('scheduler:enqueued', { id, beadId: params.beadId, polecatPid: params.polecatPid });

    // Start processing if idle
    if (!this.processing) {
      this.processNext();
    }

    return id;
  }

  bumpPriority(requestId: string, newPriority: InferencePriority): void {
    const req = this.queue.find(r => r.id === requestId);
    if (req) {
      req.priority = newPriority;
      this.sortQueue();
      this.updateState();
    }
  }

  cancelRequest(requestId: string): void {
    // If it's active, abort
    if (this.activeRequest?.id === requestId) {
      this.abortController?.abort();
      this.activeRequest.status = 'cancelled';
      this.activeRequest = null;
      this.totalCancelled++;
    } else {
      const idx = this.queue.findIndex(r => r.id === requestId);
      if (idx >= 0) {
        this.queue[idx].status = 'cancelled';
        this.queue.splice(idx, 1);
        this.totalCancelled++;
      }
    }
    this.clearStallTimer(requestId);
    this.updateState();
  }

  getState(): SchedulerState {
    return {
      queueDepth: this.queue.length,
      activeRequest: this.activeRequest?.id || null,
      activePolecatPid: this.activeRequest?.polecatPid || null,
      totalProcessed: this.totalProcessed,
      totalCancelled: this.totalCancelled,
      avgWaitTimeMs: this.waitTimes.length > 0
        ? this.waitTimes.reduce((a, b) => a + b, 0) / this.waitTimes.length
        : 0,
    };
  }

  getQueue(): InferenceRequest[] {
    return [...this.queue];
  }

  onStateChange(cb: (state: SchedulerState) => void): () => void {
    this.stateCallbacks.add(cb);
    return () => this.stateCallbacks.delete(cb);
  }

  private sortQueue(): void {
    const priorityOrder: Record<InferencePriority, number> = {
      escalated: 0,
      normal: 1,
      speculative: 2,
    };
    this.queue.sort((a, b) => {
      const pd = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pd !== 0) return pd;
      return a.createdAt - b.createdAt; // FIFO within same priority
    });
  }

  private async processNext(): Promise<void> {
    if (this.queue.length === 0) {
      this.processing = false;
      this.activeRequest = null;
      this.updateState();
      return;
    }

    this.processing = true;
    const request = this.queue.shift()!;
    this.activeRequest = request;
    request.status = 'active';
    request.startedAt = Date.now();

    // Track wait time
    this.waitTimes.push(request.startedAt - request.createdAt);
    if (this.waitTimes.length > 100) this.waitTimes.shift();

    this.updateState();

    // Set stall timer
    this.setStallTimer(request);

    // Create abort controller for time-slicing
    this.abortController = new AbortController();

    let tokenCount = 0;

    pubsub.broadcast('scheduler:started', { id: request.id, beadId: request.beadId });

    try {
      const engineStats = webllmEngine.getStats();

      if (!engineStats.isLoaded) {
        // Engine not loaded — use mock inference
        await this.mockGenerate(request);
      } else {
        // Real WebLLM inference with token budget
        const output = await webllmEngine.generate(
          request.partialOutput
            ? `Continue from: "${request.partialOutput.slice(-100)}"\n\n${request.prompt}`
            : request.prompt,
          (token: string) => {
            tokenCount++;
            request.tokensGenerated++;
            request.partialOutput += token;
            request.onToken(token);

            // Time-slice: if we've hit the token budget, abort to yield
            if (tokenCount >= request.maxTokensPerSlice && this.queue.length > 0) {
              this.abortController?.abort();
            }
          },
          this.abortController.signal,
          request.maxTokensPerSlice
        );
      }

      this.clearStallTimer(request.id);

      // Check if we were time-sliced (aborted but not cancelled)
      if (this.abortController.signal.aborted && request.status === 'active') {
        // Re-queue with remaining work
        request.status = 'paused';
        this.queue.push(request);
        this.sortQueue();
        pubsub.broadcast('scheduler:paused', { id: request.id, tokensGenerated: request.tokensGenerated });
      } else if (request.status === 'active') {
        // Completed
        request.status = 'completed';
        this.totalProcessed++;
        request.onComplete(request.partialOutput);
        pubsub.broadcast('scheduler:completed', { id: request.id, beadId: request.beadId });
      }
    } catch (e) {
      this.clearStallTimer(request.id);
      if (request.status !== 'cancelled') {
        request.status = 'stalled';
        request.onError(e as Error);
        pubsub.broadcast('scheduler:error', { id: request.id, error: e });
      }
    }

    this.activeRequest = null;
    this.updateState();

    // Process next in queue (yield to event loop first — simulates BEAM scheduler)
    setTimeout(() => this.processNext(), 0);
  }

  private async mockGenerate(request: InferenceRequest): Promise<void> {
    // Simulated inference for demo purposes when no model is loaded
    const mockResponses = [
      'Analyzing the codebase structure and identifying potential refactoring opportunities...',
      'Implementing the requested feature with proper error handling and type safety...',
      'Reviewing the pull request for potential issues and suggesting improvements...',
      'Generating comprehensive test cases for edge cases and error scenarios...',
      'Optimizing the database query performance by adding proper indexes...',
    ];
    const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    const words = response.split(' ');

    for (let i = 0; i < words.length; i++) {
      if (this.abortController?.signal.aborted) break;
      const token = (i === 0 ? '' : ' ') + words[i];
      request.tokensGenerated++;
      request.partialOutput += token;
      request.onToken(token);
      await new Promise(r => setTimeout(r, 50 + Math.random() * 100));
    }

    if (!this.abortController?.signal.aborted) {
      request.status = 'completed';
      this.totalProcessed++;
      request.onComplete(request.partialOutput);
      pubsub.broadcast('scheduler:completed', { id: request.id, beadId: request.beadId });
    }
  }

  private setStallTimer(request: InferenceRequest): void {
    const timer = setTimeout(() => {
      if (request.status === 'active') {
        request.status = 'stalled';
        pubsub.broadcast('bead:stalled', { beadId: request.beadId, polecatPid: request.polecatPid, requestId: request.id });
        pubsub.broadcast('escalation', { type: 'stall', beadId: request.beadId, polecatPid: request.polecatPid });
      }
    }, this.stallTimeoutMs);
    this.stallTimers.set(request.id, timer);
  }

  private clearStallTimer(requestId: string): void {
    const timer = this.stallTimers.get(requestId);
    if (timer) {
      clearTimeout(timer);
      this.stallTimers.delete(requestId);
    }
  }

  private updateState(): void {
    const state = this.getState();
    const table = ets.get('scheduler');
    if (table) {
      table.insert('state', state);
    }
    this.stateCallbacks.forEach(cb => cb(state));
  }
}

export const scheduler = new InferenceScheduler();
