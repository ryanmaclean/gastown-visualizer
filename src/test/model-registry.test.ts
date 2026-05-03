// Validates every advertised model ID actually exists in WebLLM's prebuiltAppConfig.
// Prevents shipping IDs that fail at engine.loadModel with
// "Cannot find model record in appConfig".

import { describe, it, expect } from 'vitest';
import { prebuiltAppConfig } from '@mlc-ai/web-llm';
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID } from '@/lib/webllm/engine';

describe('WebLLM model registry', () => {
  const prebuiltIds = new Set(prebuiltAppConfig.model_list.map(m => m.model_id));

  it('every AVAILABLE_MODELS id exists in prebuiltAppConfig', () => {
    const missing = AVAILABLE_MODELS.filter(m => !prebuiltIds.has(m.id)).map(m => m.id);
    expect(missing, `Unknown model IDs: ${missing.join(', ')}`).toEqual([]);
  });

  it('DEFAULT_MODEL_ID is loadable', () => {
    expect(prebuiltIds.has(DEFAULT_MODEL_ID)).toBe(true);
  });

  it('no duplicate ids', () => {
    const ids = AVAILABLE_MODELS.map(m => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
