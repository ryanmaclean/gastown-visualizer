// useScheduler — WebLLM scheduler state hook

import { useState, useEffect } from 'react';
import { scheduler } from '../lib/webllm/scheduler';
import { webllmEngine, type EngineStats } from '../lib/webllm/engine';

interface SchedulerHookState {
  queueDepth: number;
  activeRequest: string | null;
  activePolecatPid: string | null;
  totalProcessed: number;
  totalCancelled: number;
  avgWaitTimeMs: number;
}

export function useScheduler() {
  const [state, setState] = useState<SchedulerHookState>(scheduler.getState());

  useEffect(() => {
    return scheduler.onStateChange(setState);
  }, []);

  return state;
}

export function useEngineStats() {
  const [stats, setStats] = useState<EngineStats>(webllmEngine.getStats());

  useEffect(() => {
    return webllmEngine.onStatsChange(setStats);
  }, []);

  return stats;
}
