// Supervisor — monitors actors, restarts on crash (one_for_one)

import { Actor } from './actor';
import { ChildSpec, ActorRef, PID } from './types';
import { pubsub } from './pubsub';

interface ChildEntry {
  spec: ChildSpec;
  actor: Actor;
  restartCount: number;
}

export class Supervisor {
  private children: Map<string, ChildEntry> = new Map();
  private maxRestarts = 5;
  private unsubscribe?: () => void;

  constructor(public readonly name: string = 'supervisor') {}

  async start(): Promise<void> {
    this.unsubscribe = pubsub.subscribe('actor:crashed', (event: { pid: PID; name: string; error: any }) => {
      this.handleCrash(event.pid, event.name);
    });
  }

  async startChild(spec: ChildSpec): Promise<Actor> {
    const actor = spec.factory();
    const entry: ChildEntry = { spec, actor, restartCount: 0 };
    this.children.set(spec.name, entry);

    try {
      await actor.start();
    } catch (e) {
      console.error(`[Supervisor] Failed to start child ${spec.name}:`, e);
    }

    return actor;
  }

  async terminateChild(name: string): Promise<void> {
    const entry = this.children.get(name);
    if (entry) {
      await entry.actor.stop('shutdown');
      this.children.delete(name);
    }
  }

  whichChildren(): ActorRef[] {
    return Array.from(this.children.values()).map(e => ({
      pid: e.actor.pid,
      name: e.spec.name,
      status: e.actor.status,
    }));
  }

  getChild<T extends Actor = Actor>(name: string): T | undefined {
    return this.children.get(name)?.actor as T | undefined;
  }

  private async handleCrash(pid: PID, name: string): Promise<void> {
    // Find crashed child
    let crashedEntry: ChildEntry | undefined;
    for (const [, entry] of this.children) {
      if (entry.actor.pid === pid) {
        crashedEntry = entry;
        break;
      }
    }

    if (!crashedEntry) return;

    const strategy = crashedEntry.spec.restartStrategy || 'one_for_one';

    if (strategy === 'one_for_one') {
      await this.restartChild(crashedEntry);
    }
  }

  private async restartChild(entry: ChildEntry): Promise<void> {
    if (entry.restartCount >= this.maxRestarts) {
      console.error(`[Supervisor] Max restarts reached for ${entry.spec.name}, giving up`);
      pubsub.broadcast('supervisor:max_restarts', { name: entry.spec.name });
      return;
    }

    entry.restartCount++;
    const newActor = entry.spec.factory();
    entry.actor = newActor;

    try {
      await newActor.start();
      pubsub.broadcast('actor:restarted', { name: entry.spec.name, restartCount: entry.restartCount });
    } catch (e) {
      console.error(`[Supervisor] Restart failed for ${entry.spec.name}:`, e);
    }
  }

  async stop(): Promise<void> {
    this.unsubscribe?.();
    for (const [name] of this.children) {
      await this.terminateChild(name);
    }
  }
}
