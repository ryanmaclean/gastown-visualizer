// Virtual shell with tab completion, ghost type-ahead, and command history

import { Terminal } from '@xterm/xterm';
import { pubsub } from './otp/pubsub';
import { ets } from './otp/ets';
import type { Supervisor } from './otp/supervisor';

const ANSI = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  reset: '\x1b[0m',
  ghostFg: '\x1b[38;5;240m', // dark gray for ghost text
  saveCursor: '\x1b[s',
  restoreCursor: '\x1b[u',
} as const;

function c(text: string, style: keyof typeof ANSI): string {
  return `${ANSI[style]}${text}${ANSI.reset}`;
}

interface CommandDef {
  name: string;
  description: string;
  args?: string[];
  execute: (term: Terminal, args: string[], ctx: ShellContext) => void;
}

interface ShellContext {
  supervisor: Supervisor | null;
}

// ── Command Registry ──────────────────────────────────────────

function buildCommands(): CommandDef[] {
  return [
    {
      name: 'ets.list',
      description: 'List all ETS tables',
      execute(term) {
        const tables = ets.list();
        term.writeln(c(`ETS Tables (${tables.length}):`, 'bold'));
        tables.forEach(t => {
          const table = ets.get(t);
          term.writeln(`  ${c(t, 'cyan')} — ${c(String(table?.size() || 0), 'yellow')} entries`);
        });
      },
    },
    {
      name: 'ets.get',
      description: 'Dump table contents',
      args: ['<table>'],
      execute(term, args) {
        const tableName = args[0];
        if (!tableName) { term.writeln(c('Usage: ets.get <table_name>', 'red')); return; }
        const table = ets.get(tableName);
        if (!table) { term.writeln(c(`Table "${tableName}" not found`, 'red')); return; }
        const entries = table.tab2list();
        term.writeln(c(`${tableName} (${entries.length} entries):`, 'bold'));
        entries.forEach(([k, v]) => {
          const val = typeof v === 'object' ? JSON.stringify(v) : String(v);
          const truncated = val.length > 120 ? val.slice(0, 120) + '...' : val;
          term.writeln(`  ${c(k, 'cyan')}: ${c(truncated, 'dim')}`);
        });
      },
    },
    {
      name: 'sup.children',
      description: 'List supervisor children',
      execute(term, _args, ctx) {
        if (!ctx.supervisor) { term.writeln(c('Supervisor not ready', 'red')); return; }
        const children = ctx.supervisor.whichChildren();
        term.writeln(c(`Supervisor Children (${children.length}):`, 'bold'));
        children.forEach(child => {
          const sc = child.status === 'running' ? 'green' : child.status === 'crashed' ? 'red' : 'yellow';
          term.writeln(`  ${c(child.name, 'cyan')} ${c(`[${child.status}]`, sc as any)} ${c(`pid=${child.pid}`, 'dim')}`);
        });
      },
    },
    {
      name: 'pubsub.topics',
      description: 'List active PubSub topics',
      execute(term) {
        const topics = pubsub.getTopics();
        term.writeln(c(`Active PubSub Topics (${topics.length}):`, 'bold'));
        topics.forEach(t => term.writeln(`  ${c(t, 'cyan')}`));
      },
    },
    {
      name: 'stats',
      description: 'Show system stats',
      execute(term) {
        const statsTable = ets.get('stats');
        if (statsTable) {
          const entries = statsTable.tab2list();
          term.writeln(c('System Stats:', 'bold'));
          entries.forEach(([k, v]) => {
            term.writeln(`  ${c(k, 'cyan')}: ${c(JSON.stringify(v), 'yellow')}`);
          });
        } else {
          term.writeln(c('No stats available', 'dim'));
        }
      },
    },
    {
      name: 'clear',
      description: 'Clear terminal',
      execute(term) { term.clear(); },
    },
    {
      name: 'help',
      description: 'Show this help',
      execute(term) {
        term.writeln(c('Commands:', 'bold'));
        buildCommands().filter(cmd => cmd.name !== 'help').forEach(cmd => {
          const sig = cmd.args ? `${cmd.name} ${cmd.args.join(' ')}` : cmd.name;
          const pad = ' '.repeat(Math.max(1, 22 - sig.length));
          term.writeln(`  ${c(sig, 'cyan')}${pad}${c('—', 'dim')} ${cmd.description}`);
        });
        term.writeln(`  ${c('help', 'cyan')}                  ${c('—', 'dim')} Show this help`);
      },
    },
    {
      name: 'history',
      description: 'Show command history',
      execute() { /* handled inline by shell */ },
    },
  ];
}

// ── Shell ─────────────────────────────────────────────────────

export class GasTownShell {
  private term: Terminal;
  private ctx: ShellContext;
  private commands: CommandDef[];
  private inputBuffer = '';
  private cursorPos = 0;
  private ghostText = '';
  private history: string[] = [];
  private historyIdx = -1;
  private historyStash = '';
  private disposable: { dispose(): void } | null = null;

  private readonly PROMPT = `${ANSI.green}gastown>${ANSI.reset} `;
  private readonly PROMPT_LEN = 9; // "gastown> " visible chars

  constructor(term: Terminal, ctx: ShellContext) {
    this.term = term;
    this.commands = buildCommands();
    this.ctx = ctx;
  }

  attach() {
    this.writePrompt();
    this.disposable = this.term.onData((data: string) => this.handleInput(data));
  }

  detach() {
    this.disposable?.dispose();
    this.disposable = null;
  }

  updateContext(ctx: ShellContext) {
    this.ctx = ctx;
  }

  // ── Input handling ────────────────────────────────────────

  private handleInput(data: string) {
    // Enter
    if (data === '\r' || data === '\n') {
      this.clearGhost();
      const cmd = this.inputBuffer.trim();
      this.term.writeln('');
      if (cmd) {
        this.addToHistory(cmd);
        this.execute(cmd);
      }
      this.inputBuffer = '';
      this.cursorPos = 0;
      this.historyIdx = -1;
      this.writePrompt();
      return;
    }

    // Tab — accept ghost or cycle completions
    if (data === '\t') {
      if (this.ghostText) {
        this.acceptGhost();
      } else {
        this.tabComplete();
      }
      return;
    }

    // Ctrl+C
    if (data === '\x03') {
      this.clearGhost();
      this.inputBuffer = '';
      this.cursorPos = 0;
      this.historyIdx = -1;
      this.term.writeln('^C');
      this.writePrompt();
      return;
    }

    // Ctrl+A — home
    if (data === '\x01') {
      this.moveCursorTo(0);
      return;
    }

    // Ctrl+E — end
    if (data === '\x05') {
      this.moveCursorTo(this.inputBuffer.length);
      return;
    }

    // Ctrl+U — clear line
    if (data === '\x15') {
      this.clearGhost();
      this.inputBuffer = '';
      this.cursorPos = 0;
      this.redrawLine();
      return;
    }

    // Ctrl+W — delete word back
    if (data === '\x17') {
      this.clearGhost();
      const before = this.inputBuffer.slice(0, this.cursorPos);
      const after = this.inputBuffer.slice(this.cursorPos);
      const trimmed = before.replace(/\S+\s*$/, '');
      this.inputBuffer = trimmed + after;
      this.cursorPos = trimmed.length;
      this.redrawLine();
      this.showGhost();
      return;
    }

    // Backspace
    if (data === '\x7f' || data === '\b') {
      if (this.cursorPos > 0) {
        this.clearGhost();
        this.inputBuffer = this.inputBuffer.slice(0, this.cursorPos - 1) + this.inputBuffer.slice(this.cursorPos);
        this.cursorPos--;
        this.redrawLine();
        this.showGhost();
      }
      return;
    }

    // Delete (ESC [ 3 ~)
    if (data === '\x1b[3~') {
      if (this.cursorPos < this.inputBuffer.length) {
        this.clearGhost();
        this.inputBuffer = this.inputBuffer.slice(0, this.cursorPos) + this.inputBuffer.slice(this.cursorPos + 1);
        this.redrawLine();
        this.showGhost();
      }
      return;
    }

    // Arrow up
    if (data === '\x1b[A') {
      this.navigateHistory(-1);
      return;
    }

    // Arrow down
    if (data === '\x1b[B') {
      this.navigateHistory(1);
      return;
    }

    // Arrow left
    if (data === '\x1b[C') {
      // Right arrow — accept one ghost char or move cursor
      if (this.cursorPos < this.inputBuffer.length) {
        this.moveCursorTo(this.cursorPos + 1);
      } else if (this.ghostText) {
        this.acceptGhostChar();
      }
      return;
    }

    // Arrow left
    if (data === '\x1b[D') {
      if (this.cursorPos > 0) {
        this.moveCursorTo(this.cursorPos - 1);
      }
      return;
    }

    // Printable character
    if (data.length === 1 && data.charCodeAt(0) >= 32) {
      this.clearGhost();
      this.inputBuffer = this.inputBuffer.slice(0, this.cursorPos) + data + this.inputBuffer.slice(this.cursorPos);
      this.cursorPos++;
      this.redrawLine();
      this.showGhost();
      return;
    }
  }

  // ── Rendering ─────────────────────────────────────────────

  private writePrompt() {
    this.term.write(this.PROMPT);
    this.showGhost();
  }

  private redrawLine() {
    // Move to start of line, clear, rewrite prompt + buffer
    this.term.write(`\r\x1b[K${this.PROMPT}${this.inputBuffer}`);
    // Position cursor correctly if not at end
    const backSteps = this.inputBuffer.length - this.cursorPos;
    if (backSteps > 0) {
      this.term.write(`\x1b[${backSteps}D`);
    }
  }

  private moveCursorTo(pos: number) {
    this.cursorPos = Math.max(0, Math.min(pos, this.inputBuffer.length));
    // Absolute position: prompt length + cursor position
    this.term.write(`\r\x1b[${this.PROMPT_LEN + this.cursorPos}C`);
  }

  // ── Ghost text (type-ahead suggestion) ────────────────────

  private showGhost() {
    const suggestion = this.getSuggestion();
    if (!suggestion) {
      this.ghostText = '';
      return;
    }
    this.ghostText = suggestion;
    // Save cursor, write ghost in dim, restore cursor
    this.term.write(`${ANSI.saveCursor}${ANSI.ghostFg}${suggestion}${ANSI.reset}${ANSI.restoreCursor}`);
  }

  private clearGhost() {
    if (!this.ghostText) return;
    // Save position, clear from cursor to end of line, restore
    this.term.write(`${ANSI.saveCursor}\x1b[K${ANSI.restoreCursor}`);
    this.ghostText = '';
  }

  private acceptGhost() {
    if (!this.ghostText) return;
    const ghost = this.ghostText;
    this.clearGhost();
    this.inputBuffer += ghost;
    this.cursorPos = this.inputBuffer.length;
    this.redrawLine();
    this.showGhost();
  }

  private acceptGhostChar() {
    if (!this.ghostText) return;
    const ch = this.ghostText[0];
    this.clearGhost();
    this.inputBuffer += ch;
    this.cursorPos = this.inputBuffer.length;
    this.redrawLine();
    this.showGhost();
  }

  private getSuggestion(): string | null {
    const input = this.inputBuffer;
    if (!input || this.cursorPos !== input.length) return null;

    // Check history first (most recent match)
    for (let i = this.history.length - 1; i >= 0; i--) {
      if (this.history[i].startsWith(input) && this.history[i] !== input) {
        return this.history[i].slice(input.length);
      }
    }

    // Then check commands
    for (const cmd of this.commands) {
      if (cmd.name.startsWith(input) && cmd.name !== input) {
        return cmd.name.slice(input.length);
      }
    }

    // For ets.get, suggest table names
    if (input.startsWith('ets.get ')) {
      const partial = input.slice(8);
      const tables = ets.list();
      for (const t of tables) {
        if (t.startsWith(partial) && t !== partial) {
          return t.slice(partial.length);
        }
      }
    }

    return null;
  }

  // ── Tab completion ────────────────────────────────────────

  private tabComplete() {
    const input = this.inputBuffer;
    if (!input) return;

    // Complete command names
    const parts = input.split(/\s+/);
    if (parts.length === 1) {
      const matches = this.commands.map(c => c.name).filter(n => n.startsWith(input));
      if (matches.length === 1) {
        this.clearGhost();
        const completion = matches[0].slice(input.length);
        this.inputBuffer += completion + (matches[0] === 'ets.get' ? ' ' : '');
        this.cursorPos = this.inputBuffer.length;
        this.redrawLine();
        this.showGhost();
      } else if (matches.length > 1) {
        // Show options
        this.clearGhost();
        this.term.writeln('');
        matches.forEach(m => this.term.write(`  ${c(m, 'cyan')}  `));
        this.term.writeln('');
        // Find common prefix
        const common = this.commonPrefix(matches);
        this.inputBuffer = common;
        this.cursorPos = this.inputBuffer.length;
        this.term.write(`${this.PROMPT}${this.inputBuffer}`);
        this.showGhost();
      }
    } else if (parts[0] === 'ets.get') {
      // Complete table names
      const partial = parts[1] || '';
      const tables = ets.list().filter(t => t.startsWith(partial));
      if (tables.length === 1) {
        this.clearGhost();
        this.inputBuffer = `ets.get ${tables[0]}`;
        this.cursorPos = this.inputBuffer.length;
        this.redrawLine();
        this.showGhost();
      } else if (tables.length > 1) {
        this.clearGhost();
        this.term.writeln('');
        tables.forEach(t => this.term.write(`  ${c(t, 'cyan')}  `));
        this.term.writeln('');
        const common = this.commonPrefix(tables);
        this.inputBuffer = `ets.get ${common}`;
        this.cursorPos = this.inputBuffer.length;
        this.term.write(`${this.PROMPT}${this.inputBuffer}`);
        this.showGhost();
      }
    }
  }

  private commonPrefix(strings: string[]): string {
    if (strings.length === 0) return '';
    let prefix = strings[0];
    for (let i = 1; i < strings.length; i++) {
      while (!strings[i].startsWith(prefix)) {
        prefix = prefix.slice(0, -1);
      }
    }
    return prefix;
  }

  // ── History ───────────────────────────────────────────────

  private addToHistory(cmd: string) {
    // Deduplicate consecutive
    if (this.history[this.history.length - 1] !== cmd) {
      this.history.push(cmd);
      if (this.history.length > 100) this.history.shift();
    }
  }

  private navigateHistory(direction: -1 | 1) {
    this.clearGhost();

    if (direction === -1) {
      // Up
      if (this.historyIdx === -1) {
        if (this.history.length === 0) return;
        this.historyStash = this.inputBuffer;
        this.historyIdx = this.history.length - 1;
      } else if (this.historyIdx > 0) {
        this.historyIdx--;
      } else {
        return;
      }
      this.inputBuffer = this.history[this.historyIdx];
    } else {
      // Down
      if (this.historyIdx === -1) return;
      if (this.historyIdx < this.history.length - 1) {
        this.historyIdx++;
        this.inputBuffer = this.history[this.historyIdx];
      } else {
        this.historyIdx = -1;
        this.inputBuffer = this.historyStash;
      }
    }

    this.cursorPos = this.inputBuffer.length;
    this.redrawLine();
    this.showGhost();
  }

  // ── Execution ─────────────────────────────────────────────

  private execute(input: string) {
    const parts = input.split(/\s+/);
    const name = parts[0];
    const args = parts.slice(1);

    if (name === 'history') {
      this.term.writeln(c(`History (${this.history.length}):`, 'bold'));
      this.history.forEach((h, i) => {
        this.term.writeln(`  ${c(String(i + 1), 'dim')}  ${h}`);
      });
      return;
    }

    const cmd = this.commands.find(c => c.name === name);
    if (cmd) {
      cmd.execute(this.term, args, this.ctx);
    } else {
      this.term.writeln(c(`Unknown command: ${name}`, 'red'));
      this.term.writeln(c('Type "help" for available commands', 'dim'));
    }
  }
}

