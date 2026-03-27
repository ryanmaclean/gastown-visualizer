// usePubSub — subscribes to PubSub topic, returns latest messages

import { useState, useEffect, useRef, useCallback } from 'react';
import { pubsub } from '../lib/otp/pubsub';

export function usePubSub<T = any>(topic: string, maxMessages = 50): T[] {
  const [messages, setMessages] = useState<T[]>([]);

  useEffect(() => {
    const unsub = pubsub.subscribe<T>(topic, (msg) => {
      setMessages(prev => {
        const next = [...prev, msg];
        return next.length > maxMessages ? next.slice(-maxMessages) : next;
      });
    });
    return unsub;
  }, [topic, maxMessages]);

  return messages;
}

export function useLatestPubSub<T = any>(topic: string): T | null {
  const [latest, setLatest] = useState<T | null>(null);

  useEffect(() => {
    const unsub = pubsub.subscribe<T>(topic, (msg) => {
      setLatest(msg);
    });
    return unsub;
  }, [topic]);

  return latest;
}
