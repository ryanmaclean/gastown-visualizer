// OpenLineage event builders — spec-shaped RunEvents with Gas Town facets
// https://openlineage.io/spec/

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
  // crypto.randomUUID if available, otherwise pseudo-uuid
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

// Optional HTTP emitter — disabled unless localStorage `gastown:lineage:url` is set.
export async function maybeEmit(event: RunEvent): Promise<void> {
  try {
    const url = typeof localStorage !== 'undefined' ? localStorage.getItem('gastown:lineage:url') : null;
    if (!url) return;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
  } catch {
    // swallow — lineage emission is best-effort
  }
}
