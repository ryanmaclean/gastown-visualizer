
## OpenLineage integration — flip-card sidecar

Lineage runs as a background instrumentation layer. The only UI surface is the **back of the bead card**: a small "details" affordance flips the card 180° to reveal a scrollable lineage log; another tap flips it back. No panels, no drawers, no global feed.

### Mapping

```text
OpenLineage          Gas Town
-----------          --------
Namespace            "gastown"
Job                  "<rigId>.<beadId>"
Run                  one assignment attempt (new runId per assign)
START                bead → in_progress
RUNNING              throttled token-stream updates
COMPLETE             bead → merged
FAIL                 stalled / refinery reject
ABORT                abort_bead / mayor reassignment
Input  Dataset       prompt + bead description
Output Dataset       token stream / final output
```

Facets ("baggage") accumulated per run: `gastown_bead`, `gastown_polecat`, `gastown_inference` (model, tokens, tok/s), `gastown_lane_transition` (from→to, dwell ms), `gastown_review` (pass/fail, attempt #), plus standard `nominalTime`, `errorMessage`, `sourceCode`.

### Architecture

1. **`src/lib/lineage/openlineage.ts`** — pure builders for spec-shaped RunEvents, facet merge, ISO timestamps. No UI deps.
2. **`src/actors/lineage.ts`** — `LineageActor` subscribes to existing pubsub topics (`bead:*`, `polecat:status`, `refinery:merge`, `mayor:reassign`) and writes RunEvents into ETS.
3. **ETS tables**
   - `lineage_events` — append-only, keyed `${runId}:${seq}`, bounded ring (~500 entries global).
   - `lineage_runs` — current run per bead (runId, jobName, startedAt, lastEventAt, status, accumulated facets, attempt #).
4. **Hook**: `useBeadLineage(beadId)` returns ordered events + current run for that bead, subscribing to ETS.

### UI: card flip

- `OrderTicket.tsx` / `BeadCard.tsx` wraps content in a flip container (CSS `transform: rotateY` + `backface-visibility: hidden`, two faces same height). Local `flipped` state per card.
- **Front**: existing card, unchanged. Add a tiny corner button (icon-only `⟲` or "lineage" in the existing footer row, fits Copland aesthetic — 16px pixel icon, raised border).
- **Back**: header strip showing `runId` + attempt count + a "⟲ back" button, then a scrollable list of events:
  ```
  10:23:41.220  START      polecat=Rusty            +0ms
  10:23:41.450  RUNNING    tokens=12  tok/s=8.4    +230ms
  10:23:43.910  RUNNING    tokens=47  tok/s=12.1   +2.46s
  10:23:45.002  COMPLETE   →refinery                +1.09s
  10:23:48.700  FAIL       refinery reject          +3.70s
  ```
  Each row is mono, Copland-styled, click to expand raw JSON inline. Footer: "copy JSON" button (clipboard).
- No flip animation if `prefers-reduced-motion`; just swap faces.

### UI: nothing else

No global panel, no sidebar entry, no board badges. Terminal still gets a `lineage` command group for power users (`tail`, `show <beadId>`, `export <beadId>`, `stats`) since the shell already exists and it costs nothing.

### Files

Add:
- `src/lib/lineage/openlineage.ts`
- `src/actors/lineage.ts`
- `src/hooks/useLineage.ts`
- `src/components/BeadCardBack.tsx` — the back face (scrollable log)
- `src/test/lineage.test.ts`

Change:
- `src/context/GasTownContext.tsx` — register ETS tables, start `LineageActor` under supervisor
- `src/components/OrderTicket.tsx` (and/or `BeadCard.tsx`) — wrap in flip container, add toggle button
- `src/lib/shell.ts` — add `lineage` command group
- `src/index.css` — `.card-flip`, `.card-face`, `.card-face--back` utility classes (3D transforms)

### Tests

`lineage.test.ts`: backlog→in_progress→refinery→merged emits START + RUNNING + COMPLETE with monotonic timestamps, merged facets, correct dwell-time math. A rejected bead emits FAIL, then a fresh START on reassign with incremented attempt facet.

### Open question

Skip the optional HTTP emitter to Marquez/OL backend entirely for v1 (export via clipboard + terminal only), or include it gated behind a localStorage flag with zero UI?
