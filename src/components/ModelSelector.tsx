// ModelSelector — dropdown for WebLLM model selection with progress

import React, { useState } from 'react';
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID, type ModelId } from '../lib/webllm/engine';
import { useEngineStats } from '../hooks/useScheduler';
import { useGasTown } from '../context/GasTownContext';
import { Download, Check, Loader2 } from 'lucide-react';

export function ModelSelector() {
  const stats = useEngineStats();
  const { loadModel } = useGasTown();
  const [selectedModel, setSelectedModel] = useState<ModelId>(DEFAULT_MODEL_ID);
  const [error, setError] = useState<string | null>(null);

  const handleLoad = async () => {
    setError(null);
    try {
      await loadModel(selectedModel);
    } catch (e: any) {
      setError(e.message || 'Failed to load model');
    }
  };

  return (
    <div className="space-y-1.5">
      <select
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value as ModelId)}
        disabled={stats.isLoading}
        className="w-full bg-secondary border border-border rounded text-xs text-foreground px-2 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {AVAILABLE_MODELS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} ({m.vram})
          </option>
        ))}
      </select>

      <button
        onClick={handleLoad}
        disabled={stats.isLoading || (stats.isLoaded && stats.modelId === selectedModel)}
        className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded border border-border text-xs font-mono hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
      >
        {stats.isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : stats.isLoaded && stats.modelId === selectedModel ? (
          <Check className="w-3.5 h-3.5 text-primary" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        {stats.isLoading ? 'Loading...' : stats.isLoaded && stats.modelId === selectedModel ? 'Loaded' : 'Load Model'}
      </button>

      {/* Progress bar */}
      {stats.isLoading && (
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${stats.loadProgress * 100}%` }}
          />
        </div>
      )}

      {/* Status */}
      {stats.isLoaded && (
        <div className="text-xs text-muted-foreground font-mono">
          ✓ {stats.modelId.split('-').slice(0, 2).join(' ')} loaded in {(stats.loadTimeMs / 1000).toFixed(1)}s
        </div>
      )}

      {!stats.isLoaded && !stats.isLoading && (
        <div className="text-[10px] text-muted-foreground/60 font-mono leading-tight">
          No model loaded — mock inference active
        </div>
      )}

      {error && (
        <div className="text-xs text-destructive font-mono">{error}</div>
      )}
    </div>
  );
}
