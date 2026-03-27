

# Gas Town Demo — Updated Plan

## Overview

React + TypeScript app simulating Elixir/OTP primitives (Actor, ETS, PubSub, Supervisor) powering a Gas Town Kanban board with browser-side LLM inference via WebLLM. Dark terminal aesthetic.

---

## Architecture

```text
┌──────────────────────────────────────────────────────────┐
│                     Supervisor                           │
│                                                          │
│  ┌────────┐  ┌─────────┐×N  ┌──────┐×M  ┌──────────┐   │
│  │ Mayor  │  │ Polecat │    │ Rig  │    │ Refinery │   │
│  │ Actor  │  │ Actor   │    │Actor │    │  Actor   │   │
│  └───┬────┘  └────┬────┘    └──┬───┘    └────┬─────┘   │
│      └─────────────┴───────────┴─────────────┘          │
│                        │                                 │
│                   ┌────▼────┐                            │
│                   │ PubSub  │                            │
│                   └────┬────┘                            │
│                   ┌────▼────┐                            │
│                   │   ETS   │  (beads, polecats, etc.)   │
│                   └─────────┘                            │
│                                                          │
│            ┌───────────────────────┐                     │
│            │  WebLLM Scheduler     │                     │
│            │  ┌─────────────────┐  │                     │
│            │  │ Priority Queue  │  │                     │
│            │  │ (bead requests) │  │                     │
│            │  └───────┬─────────┘  │                     │
│            │    ┌─────▼──────┐     │                     │
│            │    │ Engine (1) │     │  ← main thread      │
│            │    └────────────┘     │                     │
│            │  Stretch goal:        │                     │
│            │    ┌──────────────┐   │                     │
│            │    │ Worker Pool  │   │  ← Web Workers      │
│            │    │ (0.6B × 2-3) │   │                     │
│            │    └──────────────┘   │                     │
│            └───────────────────────┘                     │
└──────────────────────────────────────────────────────────┘
```

---

## Part 1: OTP Primitives (`src/lib/otp/`)

- **Actor<State, Msg>** — async message loop with mailbox, `handle_cast`/`handle_call`, unique PID
- **Supervisor** — child registry, `one_for_one` restart, `start_child`/`terminate_child`
- **EtsTable<K, V>** — Map with `insert`/`lookup`/`delete`/`match`/`select`/`tab2list`, change subscriptions for React
- **PubSub** — topic-based `subscribe`/`broadcast` (topics: `bead:*`, `polecat:*`, `escalation`, `refinery:*`, `mayor:*`)

## Part 2: WebLLM Scheduler (`src/lib/webllm/`)

This is the key addition — models the BEAM scheduler concept where N logical processes share limited physical execution resources.

### Scheduler Design

**`scheduler.ts`** — singleton that manages all inference requests:

- **Priority queue**: Requests sorted by priority (escalated beads > normal beads > speculative tasks)
- **Time-slicing**: Each polecat gets a configurable max token budget per turn (e.g., 128 tokens). When a polecat hits its budget, its request is paused (generation stopped), re-queued, and the next polecat's request runs. This mirrors BEAM reduction counting.
- **Preemption**: Mayor can bump priority or cancel requests via PubSub messages
- **Fair scheduling**: Round-robin among same-priority requests, preventing starvation

**Request lifecycle**:
```text
Polecat sends {beadId, prompt, priority, maxTokensPerSlice}
  → Scheduler enqueues
  → When slot available: start/resume generation
  → Stream tokens back to polecat via callback
  → After maxTokensPerSlice tokens: pause, re-queue, serve next
  → On completion: notify polecat, remove from queue
  → On timeout (30s wall-clock): mark stalled, escalate
```

**`engine.ts`** — wraps `@mlc-ai/web-llm`:
- Single `MLCEngine` instance on main thread
- Model selector (Qwen3-0.6B / 1.7B / 4B) with progress bar
- `generate(prompt, onToken, signal?)` — streaming with AbortController for time-slice interruption
- Tracks: load time, tokens/sec, total tokens

**Scheduler state** stored in ETS `:scheduler` table:
- Queue depth, active request, per-polecat token counts, avg wait time

### Stretch Goal: Multi-Worker Mode (`src/lib/webllm/worker-pool.ts`)

- Spawn 2-3 Web Workers, each loading Qwen3-0.6B (~400MB each, fits easily in 64GB)
- Workers communicate via `postMessage` — scheduler distributes requests across workers
- True parallelism: multiple polecats generating simultaneously
- Fallback: if WebGPU unavailable in workers, degrade to single-engine mode
- UI toggle: "Single Engine (4B)" vs "Worker Pool (0.6B × N)"

## Part 3: Gas Town Actors (`src/actors/`)

- **MayorActor** — escalation queue, scans ETS for stalled beads, reassigns to least-loaded polecat, can preempt scheduler queue
- **PolecatActor** ×N — submits inference requests to scheduler (not directly to engine), receives streamed tokens, updates ETS bead state, triggers stall escalation on 30s timeout
- **RigActor** — manages bead creation, convoy bundling
- **RefineryActor** — review gate, pass/fail, moves beads to merged

## Part 4: React Hooks (`src/hooks/`)

- `useEtsTable(name)` — subscribes to table changes, returns reactive state
- `useActorSystem()` — access supervisor
- `usePubSub(topic)` — latest messages from topic
- `useScheduler()` — queue depth, active request, per-polecat stats

## Part 5: UI Components

Dark terminal aesthetic (green/amber on black, monospace).

- **KanbanBoard** — 4 columns: Backlog → In Progress → Refinery → Merged
- **BeadCard** — ID (gt-XXXXX), description, polecat assignment, status badge, convoy tag, expandable token stream, inference metrics
- **MayorPanel** (left sidebar) — escalation queue, directives log
- **PolecatPanel** (left sidebar) — agent list with status (idle/working/stalled/queued), pulsing indicator during inference
- **ModelSelector** — dropdown with size/VRAM, progress bar, single vs worker-pool toggle
- **StatsPanel** — model load time, avg tokens/sec, beads processed, escalation rate, merge rate, scheduler queue depth
- **RigSelector** — switch project containers
- **ConvoyBundler** — group beads for batch assignment

## Part 6: File Structure

```text
src/
├── lib/otp/
│   ├── actor.ts, supervisor.ts, ets.ts, pubsub.ts, types.ts
├── lib/webllm/
│   ├── scheduler.ts       # Priority queue + time-slicing
│   ├── engine.ts          # WebLLM wrapper
│   └── worker-pool.ts     # Stretch: multi-worker mode
├── actors/
│   ├── mayor.ts, polecat.ts, rig.ts, refinery.ts
├── hooks/
│   ├── useEts.ts, useActorSystem.ts, usePubSub.ts, useScheduler.ts
├── components/
│   ├── KanbanBoard.tsx, BeadCard.tsx, MayorPanel.tsx
│   ├── PolecatPanel.tsx, ModelSelector.tsx, StatsPanel.tsx
│   ├── RigSelector.tsx, ConvoyBundler.tsx
├── pages/
│   └── Index.tsx
└── context/
    └── GasTownContext.tsx
```

## Implementation Order

1. OTP primitives (pure TS)
2. WebLLM engine wrapper + scheduler with time-slicing
3. React bridge hooks
4. Gas Town actors (mock inference first, then wire to scheduler)
5. Dark terminal UI shell + Kanban board
6. Wire actors → UI via ETS subscriptions
7. WebLLM integration (model selector, streaming)
8. Polish: drag-and-drop, convoy bundling, stats panel
9. Stretch: Web Worker pool mode

## Dependencies

- `@mlc-ai/web-llm`

