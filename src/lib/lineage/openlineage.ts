// OpenLineage event builders — spec-shaped RunEvents with Gas Town facets
// https://openlineage.io/spec/

import { supabase } from '../../integrations/supabase/client';

export type RunEventType = 'START' | 'RUNNING' | 'COMPLETE' | 'FAIL' | 'ABORT' | 'OTHER';

const PRODUCER = 'https://github.com/gastown/visualizer/v1';
const SCHEMA_URL = 'https://openlineage.io/spec/2-0-2/OpenLineage.json#/$defs/RunEvent';

export interface Facet {
  _producer: string;
  _schemaURL: string;
  [k: string]: any;
}

export interface Run {
  runId: string;
  facets?: Record<string, Facet>;
}

export interface Job {
  namespace: string;
  name: string;
  facets?: Record<string, Facet>;
}

export interface Dataset {
  namespace: string;
  name: string;
  facets?: Record<string, Facet>;
}

export interface RunEvent {
  eventType: RunEventType;
  eventTime: string;
  run: Run;
  job: Job;
  inputs?: Dataset[];
  outputs?: Dataset[];
  producer: string;
  schemaURL: string;
}

let _runSeq = 0;
export function newRunId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as any).randomUUID();
  }
  _runSeq++;
  return `run-${Date.now()}-${_runSeq}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function facet(data: Record<string, any>): Facet {
  return { _producer: PRODUCER, _schemaURL: SCHEMA_URL, ...data };
}

export function buildRunEvent(opts: {
  eventType: RunEventType;
  runId: string;
  jobName: string;
  namespace?: string;
  runFacets?: Record<string, Facet>;
  jobFacets?: Record<string, Facet>;
  inputs?: Dataset[];
  outputs?: Dataset[];
}): RunEvent {
  return {
    eventType: opts.eventType,
    eventTime: nowIso(),
    run: { runId: opts.runId, facets: opts.runFacets },
    job: { namespace: opts.namespace || 'gastown', name: opts.jobName, facets: opts.jobFacets },
    inputs: opts.inputs,
    outputs: opts.outputs,
    producer: PRODUCER,
    schemaURL: SCHEMA_URL,
  };
}

export function mergeFacets(
  prev: Record<string, Facet> | undefined,
  next: Record<string, Facet> | undefined,
): Record<string, Facet> {
  return { ...(prev || {}), ...(next || {}) };
}

// ── Datadog forwarding (batched) ────────────────────────────
// On by default for the demo. Disable with localStorage.gastown:lineage:datadog = "0".
// Events buffer for ~750ms then POST to the `lineage-forward` edge function.

const FLUSH_MS = 750;
const MAX_BATCH = 50;
let _buffer: RunEvent[] = [];
let _timer: ReturnType<typeof setTimeout> | null = null;

function datadogEnabled(): boolean {
  try {
    if (typeof localStorage === 'undefined') return true;
    // Default ON; only an explicit "0" disables forwarding.
    return localStorage.getItem('gastown:lineage:datadog') !== '0';
  } catch {
    return true;
  }
}

async function flush(): Promise<void> {
  if (_buffer.length === 0) return;
  const events = _buffer.splice(0, _buffer.length);
  try {
    await supabase.functions.invoke('lineage-forward', { body: { events } });
  } catch (e) {
    // Best-effort — never block UI on lineage failures.
    console.warn('[lineage] datadog forward failed', e);
  }
}

export function maybeEmit(event: RunEvent): void {
  if (!datadogEnabled()) return;
  _buffer.push(event);
  if (_buffer.length >= MAX_BATCH) {
    if (_timer) { clearTimeout(_timer); _timer = null; }
    void flush();
    return;
  }
  if (!_timer) {
    _timer = setTimeout(() => {
      _timer = null;
      void flush();
    }, FLUSH_MS);
  }
}
