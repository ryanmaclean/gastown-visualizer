// Actor / GenServer — async message loop with mailbox
// Mirrors Elixir GenServer: init, handle_cast, handle_call, terminate

import { PID, ActorStatus, generatePid, Message, createMessage } from './types';
import { pubsub } from './pubsub';

export abstract class Actor<State = any, Msg = any> {
  public readonly pid: PID;
  public readonly name: string;
  public status: ActorStatus = 'stopped';

  protected state!: State;
  private mailbox: Array<{ msg: Message<Msg>; resolve?: (result: any) => void }> = [];
  private processing = false;
  private running = false;

  constructor(name: string) {
    this.pid = generatePid();
    this.name = name;
  }

  // --- Lifecycle hooks (override in subclass) ---

  protected abstract init(): State | Promise<State>;

  protected abstract handleCast(msg: Message<Msg>): State | Promise<State>;

  protected handleCall(msg: Message<Msg>): { reply: any; newState: State } | Promise<{ reply: any; newState: State }> {
    return { reply: undefined, newState: this.state };
  }

  protected terminate(_reason: string): void {}

  // --- Public API ---

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;
    this.status = 'running';
    try {
      this.state = await this.init();
      pubsub.broadcast('actor:started', { pid: this.pid, name: this.name });
    } catch (e) {
      this.status = 'crashed';
      pubsub.broadcast('actor:crashed', { pid: this.pid, name: this.name, error: e });
      throw e;
    }
  }

  async stop(reason = 'normal'): Promise<void> {
    this.running = false;
    this.status = 'stopped';
    this.terminate(reason);
    this.mailbox = [];
    pubsub.broadcast('actor:stopped', { pid: this.pid, name: this.name, reason });
  }

  /** Fire-and-forget message */
  cast(type: string, payload: Msg, from?: PID): void {
    if (!this.running) return;
    this.mailbox.push({ msg: createMessage(type, payload, from) });
    this.drain();
  }

  /** Request/reply message */
  call(type: string, payload: Msg, from?: PID): Promise<any> {
    if (!this.running) return Promise.reject(new Error(`Actor ${this.name} not running`));
    return new Promise((resolve) => {
      this.mailbox.push({ msg: createMessage(type, payload, from), resolve });
      this.drain();
    });
  }

  getState(): State {
    return this.state;
  }

  // --- Internal ---

  private async drain(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.mailbox.length > 0 && this.running) {
      const item = this.mailbox.shift()!;
      try {
        if (item.resolve) {
          const result = await this.handleCall(item.msg);
          this.state = result.newState;
          item.resolve(result.reply);
        } else {
          this.state = await this.handleCast(item.msg);
        }
      } catch (e) {
        console.error(`[Actor:${this.name}] Error processing message:`, e);
        this.status = 'crashed';
        pubsub.broadcast('actor:crashed', { pid: this.pid, name: this.name, error: e });
        this.processing = false;
        return;
      }
    }

    this.processing = false;
  }
}
