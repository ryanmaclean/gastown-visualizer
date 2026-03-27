// Gas Town Bead/Polecat/Rig types

export type BeadStatus = 'backlog' | 'in_progress' | 'refinery' | 'merged' | 'stalled';

export interface Bead {
  id: string;
  title: string;
  description: string;
  status: BeadStatus;
  assignedTo: string | null; // polecat PID
  rigId: string;
  convoyId: string | null;
  tokenStream: string;
  tokensGenerated: number;
  tokensPerSec: number;
  createdAt: number;
  updatedAt: number;
  escalated: boolean;
}

export type PolecatStatus = 'idle' | 'working' | 'stalled' | 'queued';

export interface PolecatState {
  pid: string;
  name: string;
  avatar: string;
  status: PolecatStatus;
  currentBeadId: string | null;
  totalBeadsProcessed: number;
  totalTokensGenerated: number;
}

export interface RigState {
  id: string;
  name: string;
  beadIds: string[];
  convoys: string[];
}

export interface EscalationEvent {
  id: string;
  type: 'stall' | 'timeout' | 'error';
  beadId: string;
  fromPolecatPid: string;
  toPolecatPid: string | null;
  timestamp: number;
  resolved: boolean;
}

let beadCounter = 0;
export function generateBeadId(): string {
  return `gt-${String(++beadCounter).padStart(5, '0')}`;
}

let escalationCounter = 0;
export function generateEscalationId(): string {
  return `esc-${++escalationCounter}`;
}
