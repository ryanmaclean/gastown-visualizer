// WebGPUBadge — small indicator showing whether the browser supports WebGPU

import { useEffect, useState } from 'react';

type Status = 'checking' | 'supported' | 'unsupported';

export function WebGPUBadge() {
  const [status, setStatus] = useState<Status>('checking');
  const [hasF16, setHasF16] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!('gpu' in navigator) || !navigator.gpu) {
        if (!cancelled) setStatus('unsupported');
        return;
      }
      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (cancelled) return;
        if (!adapter) {
          setStatus('unsupported');
          return;
        }
        setHasF16(adapter.features.has('shader-f16'));
        setStatus('supported');
      } catch {
        if (!cancelled) setStatus('unsupported');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const label =
    status === 'checking' ? 'WebGPU ?' : status === 'supported' ? `WebGPU${hasF16 ? ' + f16' : ''}` : 'No WebGPU';

  const tone =
    status === 'supported'
      ? 'border-primary/40 text-primary bg-primary/10'
      : status === 'unsupported'
        ? 'border-destructive/40 text-destructive bg-destructive/10'
        : 'border-border text-muted-foreground bg-secondary';

  const title =
    status === 'supported'
      ? `WebGPU available${hasF16 ? ' (shader-f16 supported)' : ' (no shader-f16)'}`
      : status === 'unsupported'
        ? 'WebGPU not available — models cannot run in this browser'
        : 'Detecting WebGPU…';

  return (
    <span
      title={title}
      className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[9px] font-mono uppercase tracking-wider ${tone}`}
    >
      {label}
    </span>
  );
}
