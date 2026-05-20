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

// ── Datadog forwarding (batched, with retry/backoff + inspector telemetry) ──
// On by default for the demo. Disable with localStorage.gastown:lineage:datadog = "0".
// Events buffer for ~750ms then POST to the `lineage-forward` edge function.
// Failed batches retry with exponential backoff (1s, 2s, 4s — max 3 attempts) and
// never block the UI. Each attempt is recorded for the Lineage Inspector.

const FLUSH_MS = 750;
const MAX_BATCH = 50;
const MAX_RETRIES = 3;
const MAX_INSPECTOR_RECORDS = 50;

let _buffer: RunEvent[] = [];
let _timer: ReturnType<typeof setTimeout> | null = null;
let _attemptSeq = 0;

export interface LineageBatchAttempt {
  id: number;
  startedAt: number;
  endedAt: number | null;
  durationMs: number | null;
  size: number;
  attempt: number; // 1-based
  ok: boolean | null; // null = in-flight
  error?: string;
  sampleRunIds: string[];
  eventTypes: string[];
}

const _inspector: LineageBatchAttempt[] = [];
const _inspectorSubs = new Set<(rec: LineageBatchAttempt[]) => void>();

export function getLineageInspector(): LineageBatchAttempt[] {
  return _inspector.slice();
}

export function subscribeLineageInspector(cb: (rec: LineageBatchAttempt[]) => void): () => void {
  _inspectorSubs.add(cb);
  return () => { _inspectorSubs.delete(cb); };
}

function pushInspector(rec: LineageBatchAttempt): void {
  _inspector.unshift(rec);
  if (_inspector.length > MAX_INSPECTOR_RECORDS) _inspector.length = MAX_INSPECTOR_RECORDS;
  _inspectorSubs.forEach((cb) => { try { cb(getLineageInspector()); } catch { /* noop */ } });
}

function notifyInspector(): void {
  _inspectorSubs.forEach((cb) => { try { cb(getLineageInspector()); } catch { /* noop */ } });
}

function datadogEnabled(): boolean {
  try {
    if (typeof localStorage === 'undefined') return true;
    return localStorage.getItem('gastown:lineage:datadog') !== '0';
  } catch {
    return true;
  }
}

async function postBatch(events: RunEvent[]): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('lineage-forward', { body: { events } });
    if (error) return { ok: false, error: error.message || String(error) };
    if (data && typeof data === 'object' && 'ok' in data && (data as any).ok === false) {
      const failed = ((data as any).results || []).find((r: any) => !r.ok);
      return { ok: false, error: failed?.error ? `partial: ${failed.error}` : 'partial failure' };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function flushWithRetry(events: RunEvent[]): Promise<void> {
  const id = ++_attemptSeq;
  const rec: LineageBatchAttempt = {
    id,
    startedAt: Date.now(),
    endedAt: null,
    durationMs: null,
    size: events.length,
    attempt: 1,
    ok: null,
    sampleRunIds: Array.from(new Set(events.map((e) => e.run.runId))).slice(0, 5),
    eventTypes: Array.from(new Set(events.map((e) => e.eventType))),
  };
  pushInspector(rec);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    rec.attempt = attempt;
    notifyInspector();
    const { ok, error } = await postBatch(events);
    if (ok) {
      rec.ok = true;
      rec.endedAt = Date.now();
      rec.durationMs = rec.endedAt - rec.startedAt;
      notifyInspector();
      return;
    }
    rec.error = error;
    if (attempt === MAX_RETRIES) {
      rec.ok = false;
      rec.endedAt = Date.now();
      rec.durationMs = rec.endedAt - rec.startedAt;
      notifyInspector();
      console.warn('[lineage] datadog forward failed after retries', error);
      return;
    }
    // exponential backoff: 1s, 2s
    await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
  }
}

function scheduleFlush(): void {
  if (_buffer.length === 0) return;
  const events = _buffer.splice(0, _buffer.length);
  void flushWithRetry(events);
}

export function maybeEmit(event: RunEvent): void {
  if (!datadogEnabled()) return;
  _buffer.push(event);
  if (_buffer.length >= MAX_BATCH) {
    if (_timer) { clearTimeout(_timer); _timer = null; }
    scheduleFlush();
    return;
  }
  if (!_timer) {
    _timer = setTimeout(() => {
      _timer = null;
      scheduleFlush();
    }, FLUSH_MS);
  }
}
