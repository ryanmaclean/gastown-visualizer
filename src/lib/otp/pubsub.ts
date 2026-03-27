// Topic-based PubSub — mirrors Phoenix.PubSub

import { Subscriber, Unsubscribe } from './types';

class PubSubSystem {
  private topics: Map<string, Set<Subscriber>> = new Map();
  private history: Map<string, any[]> = new Map();
  private maxHistory = 50;

  subscribe<T = any>(topic: string, callback: Subscriber<T>): Unsubscribe {
    if (!this.topics.has(topic)) {
      this.topics.set(topic, new Set());
    }
    const subs = this.topics.get(topic)!;
    subs.add(callback as Subscriber);
    return () => {
      subs.delete(callback as Subscriber);
      if (subs.size === 0) this.topics.delete(topic);
    };
  }

  broadcast<T = any>(topic: string, message: T): void {
    // Store in history
    if (!this.history.has(topic)) {
      this.history.set(topic, []);
    }
    const hist = this.history.get(topic)!;
    hist.push({ message, timestamp: Date.now() });
    if (hist.length > this.maxHistory) hist.shift();

    // Wildcard support: "bead:created" matches subscribers on "bead:*"
    const parts = topic.split(':');
    const wildcard = parts.length > 1 ? `${parts[0]}:*` : null;

    const directSubs = this.topics.get(topic);
    if (directSubs) {
      directSubs.forEach(cb => {
        try { cb(message); } catch (e) { console.error(`[PubSub] Error in subscriber for ${topic}:`, e); }
      });
    }

    if (wildcard && wildcard !== topic) {
      const wildcardSubs = this.topics.get(wildcard);
      if (wildcardSubs) {
        wildcardSubs.forEach(cb => {
          try { cb(message); } catch (e) { console.error(`[PubSub] Error in wildcard subscriber for ${wildcard}:`, e); }
        });
      }
    }
  }

  getHistory(topic: string): any[] {
    return this.history.get(topic) || [];
  }

  getTopics(): string[] {
    return Array.from(this.topics.keys());
  }

  clear(): void {
    this.topics.clear();
    this.history.clear();
  }
}

// Singleton
export const pubsub = new PubSubSystem();
