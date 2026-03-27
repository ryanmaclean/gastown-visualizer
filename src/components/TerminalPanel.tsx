// TerminalPanel — xterm.js based terminal with tabs for logs, inference, and REPL

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { pubsub } from '../lib/otp/pubsub';
import { ets } from '../lib/otp/ets';
import { useGasTown } from '../context/GasTownContext';

type TabId = 'logs' | 'inference' | 'repl';

const THEME = {
  background: '#0a0f0a',
  foreground: '#4ade80',
  cursor: '#4ade80',
  cursorAccent: '#0a0f0a',
  selectionBackground: '#4ade8040',
  black: '#0a0f0a',
  red: '#ef4444',
  green: '#4ade80',
  yellow: '#f59e0b',
  blue: '#60a5fa',
  magenta: '#c084fc',
  cyan: '#22d3ee',
  white: '#e2e8f0',
  brightBlack: '#334155',
  brightRed: '#f87171',
  brightGreen: '#86efac',
  brightYellow: '#fbbf24',
  brightBlue: '#93c5fd',
  brightMagenta: '#d8b4fe',
  brightCyan: '#67e8f9',
  brightWhite: '#f8fafc',
};

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

export function TerminalPanel() {
  const [activeTab, setActiveTab] = useState<TabId>('logs');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const logsRef = useRef<HTMLDivElement>(null);
  const inferenceRef = useRef<HTMLDivElement>(null);
  const replRef = useRef<HTMLDivElement>(null);

  const logsTermRef = useRef<{ term: Terminal; fit: FitAddon } | null>(null);
  const inferenceTermRef = useRef<{ term: Terminal; fit: FitAddon } | null>(null);
  const replTermRef = useRef<{ term: Terminal; fit: FitAddon } | null>(null);

  const { supervisor } = useGasTown();

  // Initialize terminals
  useEffect(() => {
    if (isCollapsed) return;

    const initTerm = (ref: React.RefObject<HTMLDivElement>, termRef: React.MutableRefObject<{ term: Terminal; fit: FitAddon } | null>) => {
      if (ref.current && !termRef.current) {
        const t = createTerminal();
        t.term.open(ref.current);
        setTimeout(() => t.fit.fit(), 50);
        termRef.current = t;
      }
    };

    initTerm(logsRef, logsTermRef);
    initTerm(inferenceRef, inferenceTermRef);
    initTerm(replRef, replTermRef);

    // Print welcome messages
    const logs = logsTermRef.current?.term;
    if (logs && logs.buffer.active.length <= 1) {
      logs.writeln(colorize('╔══════════════════════════════════════╗', 'green'));
      logs.writeln(colorize('║  GAS TOWN — Actor System Event Log  ║', 'green'));
      logs.writeln(colorize('╚══════════════════════════════════════╝', 'green'));
      logs.writeln('');
    }

    const inf = inferenceTermRef.current?.term;
    if (inf && inf.buffer.active.length <= 1) {
      inf.writeln(colorize('╔═══════════════════════════════════════╗', 'cyan'));
      inf.writeln(colorize('║  WebLLM Inference Streaming Output   ║', 'cyan'));
      inf.writeln(colorize('╚═══════════════════════════════════════╝', 'cyan'));
      inf.writeln('');
    }

    return () => {
      logsTermRef.current?.term.dispose();
      logsTermRef.current = null;
      inferenceTermRef.current?.term.dispose();
      inferenceTermRef.current = null;
      replTermRef.current?.term.dispose();
      replTermRef.current = null;
    };
  }, [isCollapsed]);

  // Fit on resize and tab change
  useEffect(() => {
    if (isCollapsed) return;
    const currentRef = activeTab === 'logs' ? logsTermRef : activeTab === 'inference' ? inferenceTermRef : replTermRef;
    setTimeout(() => currentRef.current?.fit.fit(), 50);

    const handleResize = () => {
      setTimeout(() => currentRef.current?.fit.fit(), 100);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab, isCollapsed]);

  // Subscribe to PubSub for actor logs
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

  // Subscribe to inference streaming output
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

  // REPL input handling
  useEffect(() => {
    if (isCollapsed) return;
    const repl = replTermRef.current?.term;
    if (!repl) return;

    let inputBuffer = '';

    const prompt = () => {
      repl.write(`\r\n${colorize('gastown>', 'green')} `);
    };

    if (repl.buffer.active.length <= 1) {
      repl.writeln(colorize('╔═══════════════════════════════════════╗', 'magenta'));
      repl.writeln(colorize('║  Gas Town Interactive REPL            ║', 'magenta'));
      repl.writeln(colorize('╚═══════════════════════════════════════╝', 'magenta'));
      repl.writeln('');
      repl.writeln(`${colorize('Commands:', 'bold')}`);
      repl.writeln(`  ${colorize('ets.list', 'cyan')}          — List all ETS tables`);
      repl.writeln(`  ${colorize('ets.get <table>', 'cyan')}   — Dump table contents`);
      repl.writeln(`  ${colorize('sup.children', 'cyan')}      — List supervisor children`);
      repl.writeln(`  ${colorize('pubsub.topics', 'cyan')}     — List active PubSub topics`);
      repl.writeln(`  ${colorize('stats', 'cyan')}              — Show system stats`);
      repl.writeln(`  ${colorize('help', 'cyan')}               — Show this help`);
      repl.writeln(`  ${colorize('clear', 'cyan')}              — Clear terminal`);
      prompt();
    }

    const handleData = repl.onData((data: string) => {
      if (data === '\r' || data === '\n') {
        const cmd = inputBuffer.trim();
        inputBuffer = '';
        repl.writeln('');
        executeCommand(repl, cmd);
        prompt();
      } else if (data === '\x7f' || data === '\b') {
        if (inputBuffer.length > 0) {
          inputBuffer = inputBuffer.slice(0, -1);
          repl.write('\b \b');
        }
      } else if (data === '\x03') {
        inputBuffer = '';
        repl.writeln('^C');
        prompt();
      } else if (data.length === 1 && data.charCodeAt(0) >= 32) {
        inputBuffer += data;
        repl.write(data);
      }
    });

    return () => handleData.dispose();
  }, [isCollapsed, supervisor]);

  const executeCommand = useCallback((term: Terminal, cmd: string) => {
    if (!cmd) return;

    const parts = cmd.split(/\s+/);
    const command = parts[0];

    switch (command) {
      case 'ets.list': {
        const tables = ets.list();
        term.writeln(colorize(`ETS Tables (${tables.length}):`, 'bold'));
        tables.forEach(t => {
          const table = ets.get(t);
          term.writeln(`  ${colorize(t, 'cyan')} — ${colorize(String(table?.size() || 0), 'yellow')} entries`);
        });
        break;
      }
      case 'ets.get': {
        const tableName = parts[1];
        if (!tableName) {
          term.writeln(colorize('Usage: ets.get <table_name>', 'red'));
          break;
        }
        const table = ets.get(tableName);
        if (!table) {
          term.writeln(colorize(`Table "${tableName}" not found`, 'red'));
          break;
        }
        const entries = table.tab2list();
        term.writeln(colorize(`${tableName} (${entries.length} entries):`, 'bold'));
        entries.forEach(([k, v]) => {
          const val = typeof v === 'object' ? JSON.stringify(v) : String(v);
          const truncated = val.length > 120 ? val.slice(0, 120) + '...' : val;
          term.writeln(`  ${colorize(k, 'cyan')}: ${colorize(truncated, 'dim')}`);
        });
        break;
      }
      case 'sup.children': {
        if (!supervisor) {
          term.writeln(colorize('Supervisor not ready', 'red'));
          break;
        }
        const children = supervisor.whichChildren();
        term.writeln(colorize(`Supervisor Children (${children.length}):`, 'bold'));
        children.forEach(c => {
          const statusColor = c.status === 'running' ? 'green' : c.status === 'crashed' ? 'red' : 'yellow';
          term.writeln(`  ${colorize(c.name, 'cyan')} ${colorize(`[${c.status}]`, statusColor)} ${colorize(`pid=${c.pid}`, 'dim')}`);
        });
        break;
      }
      case 'pubsub.topics': {
        const topics = pubsub.getTopics();
        term.writeln(colorize(`Active PubSub Topics (${topics.length}):`, 'bold'));
        topics.forEach(t => term.writeln(`  ${colorize(t, 'cyan')}`));
        break;
      }
      case 'stats': {
        const statsTable = ets.get('stats');
        if (statsTable) {
          const entries = statsTable.tab2list();
          term.writeln(colorize('System Stats:', 'bold'));
          entries.forEach(([k, v]) => {
            term.writeln(`  ${colorize(k, 'cyan')}: ${colorize(JSON.stringify(v), 'yellow')}`);
          });
        } else {
          term.writeln(colorize('No stats available', 'dim'));
        }
        break;
      }
      case 'help': {
        term.writeln(`${colorize('Commands:', 'bold')}`);
        term.writeln(`  ${colorize('ets.list', 'cyan')}          — List all ETS tables`);
        term.writeln(`  ${colorize('ets.get <table>', 'cyan')}   — Dump table contents`);
        term.writeln(`  ${colorize('sup.children', 'cyan')}      — List supervisor children`);
        term.writeln(`  ${colorize('pubsub.topics', 'cyan')}     — List active PubSub topics`);
        term.writeln(`  ${colorize('stats', 'cyan')}              — Show system stats`);
        term.writeln(`  ${colorize('clear', 'cyan')}              — Clear terminal`);
        break;
      }
      case 'clear':
        term.clear();
        break;
      default:
        term.writeln(colorize(`Unknown command: ${command}`, 'red'));
        term.writeln(colorize('Type "help" for available commands', 'dim'));
    }
  }, [supervisor]);

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'logs', label: 'Actor Logs', icon: '▤' },
    { id: 'inference', label: 'Inference', icon: '◎' },
    { id: 'repl', label: 'REPL', icon: '>' },
  ];

  return (
    <div className={`border-t border-border bg-card/80 flex flex-col ${isCollapsed ? 'h-8' : 'h-64'} transition-all`}>
      {/* Tab bar */}
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

      {/* Terminal containers */}
      {!isCollapsed && (
        <div className="flex-1 relative">
          <div ref={logsRef} className={`absolute inset-0 ${activeTab === 'logs' ? '' : 'hidden'}`} />
          <div ref={inferenceRef} className={`absolute inset-0 ${activeTab === 'inference' ? '' : 'hidden'}`} />
          <div ref={replRef} className={`absolute inset-0 ${activeTab === 'repl' ? '' : 'hidden'}`} />
        </div>
      )}
    </div>
  );
}
