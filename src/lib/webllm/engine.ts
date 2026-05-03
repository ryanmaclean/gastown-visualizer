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

// Custom model configs for models not in WebLLM's built-in list (kept for future use)
const CUSTOM_MODEL_CONFIGS: Record<string, any> = {};

// Available models — curated from WebLLM 0.2.82 prebuiltAppConfig (May 2026)
export const AVAILABLE_MODELS = [
  // Qwen 3.5 — newest generation (May 2026)
  { id: 'Qwen3.5-0.8B-q4f16_1-MLC', name: 'Qwen3.5 0.8B', vram: '~1.6GB', description: '🆕 Qwen3.5 — fastest, lightweight' },
  { id: 'Qwen3.5-2B-q4f16_1-MLC', name: 'Qwen3.5 2B', vram: '~2.2GB', description: '🆕 Qwen3.5 — balanced' },
  { id: 'Qwen3.5-4B-q4f16_1-MLC', name: 'Qwen3.5 4B', vram: '~3.9GB', description: '🆕 Qwen3.5 — good quality' },
  { id: 'Qwen3.5-9B-q4f16_1-MLC', name: 'Qwen3.5 9B', vram: '~6.4GB', description: '🆕 Qwen3.5 — best quality' },
  // Qwen 3 (still solid)
  { id: 'Qwen3-0.6B-q4f16_1-MLC', name: 'Qwen3 0.6B', vram: '~1.4GB', description: 'Fast, lightweight — good for multi-worker' },
  { id: 'Qwen3-1.7B-q4f16_1-MLC', name: 'Qwen3 1.7B', vram: '~2GB', description: 'Balanced speed/quality' },
  { id: 'Qwen3-4B-q4f16_1-MLC', name: 'Qwen3 4B', vram: '~3.4GB', description: 'Good quality, moderate speed' },
  { id: 'Qwen3-8B-q4f16_1-MLC', name: 'Qwen3 8B', vram: '~5.7GB', description: 'High quality — recommended for M1 Max' },
  // Phi-4-mini
  { id: 'Phi-4-mini-instruct-q4f16_1-MLC', name: 'Phi-4 mini', vram: '~3.4GB', description: 'Microsoft Phi-4 mini, strong reasoning' },
  // Gemma 3
  { id: 'gemma3-1b-it-q4f16_1-MLC', name: 'Gemma 3 1B', vram: '~700MB', description: 'Google Gemma 3 — tiny + fast' },
  // OLMo 2
  { id: 'OLMo-2-0425-1B-Instruct-q4f16_1-MLC', name: 'OLMo 2 1B', vram: '~1.8GB', description: 'AllenAI OLMo 2 — fully open' },
  { id: 'OLMo-2-1124-7B-Instruct-q4f16_1-MLC', name: 'OLMo 2 7B', vram: '~6.5GB', description: 'AllenAI OLMo 2 — fully open, larger' },
  // Llama 3.2
  { id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC', name: 'Llama 3.2 1B', vram: '~880MB', description: 'Meta Llama 3.2 — tiny' },
  { id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC', name: 'Llama 3.2 3B', vram: '~2.3GB', description: 'Meta Llama 3.2 — balanced' },
  // DeepSeek R1 distills (reasoning)
  { id: 'DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC', name: 'DeepSeek R1 7B', vram: '~5.1GB', description: 'Reasoning distill — chain-of-thought' },
  { id: 'DeepSeek-R1-Distill-Llama-8B-q4f16_1-MLC', name: 'DeepSeek R1 Llama 8B', vram: '~5GB', description: 'Reasoning distill on Llama' },
] as const;

export const DEFAULT_MODEL_ID: ModelId = 'Qwen3.5-2B-q4f16_1-MLC';

export type ModelId = typeof AVAILABLE_MODELS[number]['id'];
