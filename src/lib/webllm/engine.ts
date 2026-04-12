// WebLLM Engine wrapper — single MLCEngine instance with streaming support

import type { MLCEngine, InitProgressReport, AppConfig } from '@mlc-ai/web-llm';

export interface EngineStats {
  modelId: string;
  loadTimeMs: number;
  totalTokens: number;
  avgTokensPerSec: number;
  isLoaded: boolean;
  isLoading: boolean;
  loadProgress: number;
}

export type LoadProgressCallback = (progress: InitProgressReport) => void;

class WebLLMEngine {
  private engine: MLCEngine | null = null;
  private stats: EngineStats = {
    modelId: '',
    loadTimeMs: 0,
    totalTokens: 0,
    avgTokensPerSec: 0,
    isLoaded: false,
    isLoading: false,
    loadProgress: 0,
  };
  private tokenTimings: number[] = [];
  private onProgressCallbacks: Set<LoadProgressCallback> = new Set();
  private onStatsChangeCallbacks: Set<(stats: EngineStats) => void> = new Set();

  async loadModel(modelId: string): Promise<void> {
    if (this.stats.isLoading) return;
    if (this.stats.isLoaded && this.stats.modelId === modelId) return;

    // Check WebGPU availability before attempting to load
    if (!navigator.gpu) {
      throw new Error('WebGPU is not supported in this browser. Please use Chrome 113+ or Edge 113+.');
    }
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error('No WebGPU adapter found. Your GPU may not be supported.');
    }

    // Check shader-f16 for models that require it
    const customModel = CUSTOM_MODEL_CONFIGS[modelId];
    if (customModel?.required_features?.includes('shader-f16')) {
      const features = adapter.features;
      if (!features.has('shader-f16')) {
        throw new Error(`Model "${modelId}" requires shader-f16 which is not supported by your GPU.`);
      }
    }

    this.stats = { ...this.stats, isLoading: true, loadProgress: 0, modelId };
    this.notifyStats();

    try {
      // Dynamic import to avoid loading WebLLM until needed
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm');

      const startTime = performance.now();

      // Build appConfig with custom models that aren't in the built-in list
      const customModel = CUSTOM_MODEL_CONFIGS[modelId];
      const engineConfig: any = {
        initProgressCallback: (progress: InitProgressReport) => {
          this.stats.loadProgress = progress.progress || 0;
          this.notifyProgress(progress);
          this.notifyStats();
        },
      };
      if (customModel) {
        engineConfig.appConfig = {
          model_list: [customModel],
          useIndexedDBCache: false,
        } as AppConfig;
      }

      this.engine = await CreateMLCEngine(modelId, engineConfig);

      const loadTimeMs = performance.now() - startTime;

      this.stats = {
        ...this.stats,
        loadTimeMs,
        isLoaded: true,
        isLoading: false,
        loadProgress: 1,
      };
      this.notifyStats();
    } catch (e) {
      this.stats = { ...this.stats, isLoading: false, isLoaded: false };
      this.notifyStats();
      throw e;
    }
  }

  async generate(
    prompt: string,
    onToken: (token: string) => void,
    signal?: AbortSignal,
    maxTokens: number = 512
  ): Promise<string> {
    if (!this.engine) throw new Error('Engine not loaded');

    let output = '';
    let tokenCount = 0;
    const startTime = performance.now();

    try {
      const completion = await this.engine.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        stream: true,
        temperature: 0.7,
      });

      for await (const chunk of completion) {
        if (signal?.aborted) break;

        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
          output += delta;
          tokenCount++;
          onToken(delta);

          const elapsed = (performance.now() - startTime) / 1000;
          if (elapsed > 0) {
            this.tokenTimings.push(tokenCount / elapsed);
            if (this.tokenTimings.length > 100) this.tokenTimings.shift();
          }
        }
      }
    } catch (e) {
      if (signal?.aborted) {
        // Expected interruption for time-slicing
      } else {
        throw e;
      }
    }

    this.stats.totalTokens += tokenCount;
    this.stats.avgTokensPerSec = this.tokenTimings.length > 0
      ? this.tokenTimings.reduce((a, b) => a + b, 0) / this.tokenTimings.length
      : 0;
    this.notifyStats();

    return output;
  }

  getStats(): EngineStats {
    return { ...this.stats };
  }

  onProgress(cb: LoadProgressCallback): () => void {
    this.onProgressCallbacks.add(cb);
    return () => this.onProgressCallbacks.delete(cb);
  }

  onStatsChange(cb: (stats: EngineStats) => void): () => void {
    this.onStatsChangeCallbacks.add(cb);
    return () => this.onStatsChangeCallbacks.delete(cb);
  }

  private notifyProgress(progress: InitProgressReport): void {
    this.onProgressCallbacks.forEach(cb => cb(progress));
  }

  private notifyStats(): void {
    this.onStatsChangeCallbacks.forEach(cb => cb(this.getStats()));
  }

  async unload(): Promise<void> {
    if (this.engine) {
      await this.engine.unload();
      this.engine = null;
      this.stats = { ...this.stats, isLoaded: false, modelId: '' };
      this.notifyStats();
    }
  }
}

export const webllmEngine = new WebLLMEngine();

// Custom model configs for models not in WebLLM's built-in list
const GEMMA4_REPO = 'https://huggingface.co/welcoma/gemma-4-E2B-it-q4f16_1-MLC';

const CUSTOM_MODEL_CONFIGS: Record<string, any> = {
  'gemma-4-E2B-it-q4f16_1-MLC': {
    model: GEMMA4_REPO,
    model_id: 'gemma-4-E2B-it-q4f16_1-MLC',
    model_lib: `${GEMMA4_REPO}/resolve/main/libs/gemma-4-E2B-it-q4f16_1-MLC-webgpu.wasm`,
    required_features: ['shader-f16'] as string[],
  },
};

// Available models — Qwen3.5 not yet in WebLLM (issue #778), Qwen3 up to 8B available
export const AVAILABLE_MODELS = [
  { id: 'gemma-4-E2B-it-q4f16_1-MLC', name: 'Gemma 4 E2B', vram: '~2.7GB', description: '⚡ Experimental — custom fork, text-only' },
  { id: 'Qwen3-0.6B-q4f16_1-MLC', name: 'Qwen3 0.6B', vram: '~400MB', description: 'Fast, lightweight — good for multi-worker' },
  { id: 'Qwen3-1.7B-q4f16_1-MLC', name: 'Qwen3 1.7B', vram: '~1GB', description: 'Balanced speed/quality' },
  { id: 'Qwen3-4B-q4f16_1-MLC', name: 'Qwen3 4B', vram: '~2.5GB', description: 'Good quality, moderate speed' },
  { id: 'Qwen3-8B-q4f16_1-MLC', name: 'Qwen3 8B', vram: '~5GB', description: 'Best quality — recommended for M1 Max 64GB' },
] as const;

export const DEFAULT_MODEL_ID: ModelId = 'Qwen3-8B-q4f16_1-MLC';

export type ModelId = typeof AVAILABLE_MODELS[number]['id'];
