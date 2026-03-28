// TerminalPanel — xterm.js based terminal with tabs for logs, inference, and REPL

import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { pubsub } from '../lib/otp/pubsub';
import { useGasTown } from '../context/GasTownContext';
import { GasTownShell } from '../lib/shell';

type TabId = 'logs' | 'inference' | 'repl';

function hslVarToHex(varName: string): string {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  if (!raw) return '#000000';
  const parts = raw.split(/\s+/);
  const h = parseFloat(parts[0]) || 0;
  const s = (parseFloat(parts[1]) || 0) / 100;
  const l = (parseFloat(parts[2]) || 0) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(c * 255).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function buildTerminalTheme(): Record<string, string> {
  const bg = hslVarToHex('--background');
  const fg = hslVarToHex('--foreground');
  const green = hslVarToHex('--terminal-green');
  const amber = hslVarToHex('--terminal-amber');
  const red = hslVarToHex('--terminal-red');
  const cyan = hslVarToHex('--terminal-cyan');
  const primary = hslVarToHex('--primary');
  const muted = hslVarToHex('--muted-foreground');
  return {
    background: bg,
    foreground: green,
    cursor: green,
    cursorAccent: bg,
    selectionBackground: green + '40',
    black: bg,
    red,
    green,
    yellow: amber,
    blue: primary,
    magenta: hslVarToHex('--accent-foreground'),
    cyan,
    white: fg,
    brightBlack: muted,
    brightRed: red,
    brightGreen: green,
    brightYellow: amber,
    brightBlue: primary,
    brightMagenta: hslVarToHex('--accent-foreground'),
    brightCyan: cyan,
    brightWhite: hslVarToHex('--card-foreground'),
  };
}

function createTerminal(): { term: Terminal; fit: FitAddon } {
  const fit = new FitAddon();
  const term = new Terminal({
    theme: THEME,
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12,
    lineHeight: 1.3,
    cursorBlink: true,
    cursorStyle: 'block',
    scrollback: 2000,
    allowTransparency: true,
  });
  term.loadAddon(fit);
  term.loadAddon(new WebLinksAddon());
  return { term, fit };
}

function timestamp(): string {
  return new Date().toISOString().slice(11, 23);
}

function colorize(text: string, color: string): string {
  const codes: Record<string, string> = {
    green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m',
    blue: '\x1b[34m', cyan: '\x1b[36m', magenta: '\x1b[35m',
    dim: '\x1b[2m', bold: '\x1b[1m', reset: '\x1b[0m',
  };
  return `${codes[color] || ''}${text}${codes.reset}`;
}

function writeLogsBanner(term: Terminal) {
  term.writeln(colorize('╔══════════════════════════════════════╗', 'green'));
  term.writeln(colorize('║  GAS TOWN — Actor System Event Log  ║', 'green'));
  term.writeln(colorize('╚══════════════════════════════════════╝', 'green'));
  term.writeln('');
  term.writeln(`${colorize(timestamp(), 'dim')} ${colorize('●', 'green')} ${colorize('BOOT', 'bold')} ${colorize('Terminal ready — waiting for actor events', 'dim')}`);
}

function writeInferenceBanner(term: Terminal) {
  term.writeln(colorize('╔═══════════════════════════════════════╗', 'cyan'));
  term.writeln(colorize('║  WebLLM Inference Streaming Output   ║', 'cyan'));
  term.writeln(colorize('╚═══════════════════════════════════════╝', 'cyan'));
  term.writeln('');
  term.writeln(`${colorize(timestamp(), 'dim')} ${colorize('◎', 'cyan')} ${colorize('READY', 'bold')} ${colorize('Waiting for inference stream', 'dim')}`);
}

function writeReplBanner(term: Terminal) {
  term.writeln(colorize('╔═══════════════════════════════════════╗', 'magenta'));
  term.writeln(colorize('║  Gas Town Interactive REPL            ║', 'magenta'));
  term.writeln(colorize('╚═══════════════════════════════════════╝', 'magenta'));
  term.writeln('');
  term.writeln(`${colorize('Commands:', 'bold')}`);
  term.writeln(`  ${colorize('ets.list', 'cyan')}          — List all ETS tables`);
  term.writeln(`  ${colorize('ets.get <table>', 'cyan')}   — Dump table contents`);
  term.writeln(`  ${colorize('sup.children', 'cyan')}      — List supervisor children`);
  term.writeln(`  ${colorize('pubsub.topics', 'cyan')}     — List active PubSub topics`);
  term.writeln(`  ${colorize('stats', 'cyan')}              — Show system stats`);
  term.writeln(`  ${colorize('help', 'cyan')}               — Show this help`);
  term.writeln(`  ${colorize('clear', 'cyan')}              — Clear terminal`);
  term.write(`\r\n${colorize('gastown>', 'green')} `);
}

export function TerminalPanel() {
  const [activeTab, setActiveTab] = useState<TabId>('logs');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const logsRef = useRef<HTMLDivElement>(null);
  const inferenceRef = useRef<HTMLDivElement>(null);
  const replRef = useRef<HTMLDivElement>(null);

  const logsTermRef = useRef<{ term: Terminal; fit: FitAddon } | null>(null);
  const inferenceTermRef = useRef<{ term: Terminal; fit: FitAddon } | null>(null);
  const replTermRef = useRef<{ term: Terminal; fit: FitAddon } | null>(null);
  const shellRef = useRef<GasTownShell | null>(null);
  const initializedRef = useRef<{ logs: boolean; inference: boolean; repl: boolean }>({
    logs: false,
    inference: false,
    repl: false,
  });

  const { supervisor } = useGasTown();

  useEffect(() => {
    if (isCollapsed) return;

    const initTerm = (
      ref: React.RefObject<HTMLDivElement>,
      termRef: React.MutableRefObject<{ term: Terminal; fit: FitAddon } | null>,
      kind: TabId,
    ) => {
      if (ref.current && !termRef.current) {
        const t = createTerminal();
        t.term.open(ref.current);
        termRef.current = t;

        requestAnimationFrame(() => {
          t.fit.fit();

          if (!initializedRef.current[kind]) {
            if (kind === 'logs') writeLogsBanner(t.term);
            if (kind === 'inference') writeInferenceBanner(t.term);
            if (kind === 'repl') writeReplBanner(t.term);
            initializedRef.current[kind] = true;
          }
        });
      }
    };

    initTerm(logsRef, logsTermRef, 'logs');
    initTerm(inferenceRef, inferenceTermRef, 'inference');
    initTerm(replRef, replTermRef, 'repl');

    return () => {
      logsTermRef.current?.term.dispose();
      logsTermRef.current = null;
      inferenceTermRef.current?.term.dispose();
      inferenceTermRef.current = null;
      replTermRef.current?.term.dispose();
      replTermRef.current = null;
      initializedRef.current = { logs: false, inference: false, repl: false };
    };
  }, [isCollapsed]);

  useEffect(() => {
    if (isCollapsed) return;
    const currentRef = activeTab === 'logs' ? logsTermRef : activeTab === 'inference' ? inferenceTermRef : replTermRef;
    requestAnimationFrame(() => currentRef.current?.fit.fit());

    const handleResize = () => {
      requestAnimationFrame(() => currentRef.current?.fit.fit());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab, isCollapsed]);

  useEffect(() => {
    if (isCollapsed) return;
    const unsubs: (() => void)[] = [];

    unsubs.push(pubsub.subscribe('actor:started', (data: any) => {
      logsTermRef.current?.term.writeln(
        `${colorize(timestamp(), 'dim')} ${colorize('▶', 'green')} ${colorize('STARTED', 'bold')} ${colorize(data.name, 'cyan')} ${colorize(`pid=${data.pid}`, 'dim')}`
      );
    }));

    unsubs.push(pubsub.subscribe('actor:stopped', (data: any) => {
      logsTermRef.current?.term.writeln(
        `${colorize(timestamp(), 'dim')} ${colorize('■', 'red')} ${colorize('STOPPED', 'bold')} ${colorize(data.name, 'cyan')} ${colorize(`reason=${data.reason}`, 'dim')}`
      );
    }));

    unsubs.push(pubsub.subscribe('actor:crashed', (data: any) => {
      logsTermRef.current?.term.writeln(
        `${colorize(timestamp(), 'dim')} ${colorize('✖', 'red')} ${colorize('CRASHED', 'red')} ${colorize(data.name, 'cyan')} ${colorize(String(data.error), 'red')}`
      );
    }));

    unsubs.push(pubsub.subscribe('bead:*', (data: any) => {
      const status = data?.status || data?.beadId || '';
      logsTermRef.current?.term.writeln(
        `${colorize(timestamp(), 'dim')} ${colorize('●', 'yellow')} ${colorize('BEAD', 'yellow')} ${colorize(data?.id || data?.beadId || '?', 'cyan')} → ${colorize(String(status), 'green')}`
      );
    }));

    unsubs.push(pubsub.subscribe('polecat:*', (data: any) => {
      logsTermRef.current?.term.writeln(
        `${colorize(timestamp(), 'dim')} ${colorize('🦨', 'magenta')} ${colorize('POLECAT', 'magenta')} ${colorize(data?.name || data?.pid || '?', 'cyan')} ${colorize(JSON.stringify(data).slice(0, 80), 'dim')}`
      );
    }));

    unsubs.push(pubsub.subscribe('scheduler:*', (data: any) => {
      logsTermRef.current?.term.writeln(
        `${colorize(timestamp(), 'dim')} ${colorize('⚡', 'blue')} ${colorize('SCHEDULER', 'blue')} ${colorize(JSON.stringify(data).slice(0, 100), 'dim')}`
      );
    }));

    unsubs.push(pubsub.subscribe('mayor:*', (data: any) => {
      logsTermRef.current?.term.writeln(
        `${colorize(timestamp(), 'dim')} ${colorize('👑', 'yellow')} ${colorize('MAYOR', 'yellow')} ${colorize(JSON.stringify(data).slice(0, 100), 'dim')}`
      );
    }));

    unsubs.push(pubsub.subscribe('refinery:*', (data: any) => {
      logsTermRef.current?.term.writeln(
        `${colorize(timestamp(), 'dim')} ${colorize('🔧', 'green')} ${colorize('REFINERY', 'green')} ${colorize(JSON.stringify(data).slice(0, 100), 'dim')}`
      );
    }));

    return () => unsubs.forEach(u => u());
  }, [isCollapsed]);

  useEffect(() => {
    if (isCollapsed) return;
    const unsubs: (() => void)[] = [];

    unsubs.push(pubsub.subscribe('inference:token', (data: any) => {
      inferenceTermRef.current?.term.write(colorize(data?.token || '', 'green'));
    }));

    unsubs.push(pubsub.subscribe('inference:start', (data: any) => {
      const inf = inferenceTermRef.current?.term;
      if (inf) {
        inf.writeln('');
        inf.writeln(`${colorize(timestamp(), 'dim')} ${colorize('▶ INFERENCE START', 'cyan')} ${colorize(data?.beadId || '?', 'yellow')} ${colorize(`polecat=${data?.polecatPid || '?'}`, 'dim')}`);
        inf.writeln(colorize('─'.repeat(60), 'dim'));
      }
    }));

    unsubs.push(pubsub.subscribe('inference:complete', (data: any) => {
      const inf = inferenceTermRef.current?.term;
      if (inf) {
        inf.writeln('');
        inf.writeln(colorize('─'.repeat(60), 'dim'));
        inf.writeln(`${colorize(timestamp(), 'dim')} ${colorize('✔ COMPLETE', 'green')} ${colorize(`${data?.tokensGenerated || 0} tokens`, 'yellow')} ${colorize(`${data?.tokensPerSec?.toFixed(1) || '?'} t/s`, 'cyan')}`);
      }
    }));

    return () => unsubs.forEach(u => u());
  }, [isCollapsed]);

  // Wire up the shell to the REPL terminal
  useEffect(() => {
    if (isCollapsed) return;
    const repl = replTermRef.current?.term;
    if (!repl) return;

    const shell = new GasTownShell(repl, { supervisor });
    shellRef.current = shell;
    shell.attach();

    return () => {
      shell.detach();
      shellRef.current = null;
    };
  }, [isCollapsed, supervisor]);

  // Keep shell context updated when supervisor changes
  useEffect(() => {
    shellRef.current?.updateContext({ supervisor });
  }, [supervisor]);

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'logs', label: 'Actor Logs', icon: '▤' },
    { id: 'inference', label: 'Inference', icon: '◎' },
    { id: 'repl', label: 'REPL', icon: '>' },
  ];

  return (
    <div className={`border-t border-border bg-card/80 flex flex-col ${isCollapsed ? 'h-8' : 'h-64'} transition-all`}>
      <div className="flex items-center justify-between px-2 h-8 min-h-[2rem] border-b border-border bg-card/50">
        <div className="flex items-center gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setIsCollapsed(false); }}
              className={`px-2 py-0.5 text-xs font-mono rounded transition-colors ${
                activeTab === tab.id && !isCollapsed
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-xs font-mono text-muted-foreground hover:text-foreground px-1"
        >
          {isCollapsed ? '▲' : '▼'}
        </button>
      </div>

      {!isCollapsed && (
        <div className="flex-1 relative min-h-0">
          <div ref={logsRef} className={`absolute inset-0 ${activeTab === 'logs' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'}`} />
          <div ref={inferenceRef} className={`absolute inset-0 ${activeTab === 'inference' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'}`} />
          <div ref={replRef} className={`absolute inset-0 ${activeTab === 'repl' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'}`} />
        </div>
      )}
    </div>
  );
}
