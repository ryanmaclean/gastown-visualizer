// OTP-in-the-Browser type definitions

let pidCounter = 0;
export function generatePid(): string {
  return `pid_${++pidCounter}`;
}

export type PID = string;

export type ActorStatus = 'running' | 'stopped' | 'crashed' | 'restarting';

export interface ActorRef {
  pid: PID;
  name: string;
  status: ActorStatus;
}

export type RestartStrategy = 'one_for_one' | 'one_for_all' | 'rest_for_one';

export interface ChildSpec<S = any, M = any> {
  name: string;
  factory: () => import('./actor').Actor<S, M>;
  restartStrategy?: RestartStrategy;
}

export interface Message<T = any> {
  type: string;
  payload: T;
  from?: PID;
  timestamp: number;
}

export function createMessage<T>(type: string, payload: T, from?: PID): Message<T> {
  return { type, payload, from, timestamp: Date.now() };
}

// ETS match pattern
export type MatchPattern<V> = Partial<V> | ((value: V) => boolean);

// PubSub
export type Subscriber<T = any> = (message: T) => void;
export type Unsubscribe = () => void;

// Scheduler
export type InferenceStatus = 'queued' | 'active' | 'paused' | 'completed' | 'cancelled' | 'stalled';
export type InferencePriority = 'escalated' | 'normal' | 'speculative';

export interface InferenceRequest {
  id: string;
  beadId: string;
  polecatPid: PID;
  prompt: string;
  priority: InferencePriority;
  maxTokensPerSlice: number;
  status: InferenceStatus;
  tokensGenerated: number;
  partialOutput: string;
  onToken: (token: string) => void;
  onComplete: (output: string) => void;
  onError: (error: Error) => void;
  createdAt: number;
  startedAt?: number;
}
