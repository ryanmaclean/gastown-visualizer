// InternetMap — Hilbert-curve IPv4 /8 block map.
// Each of the 256 /8 subnets is one cell on a 16×16 Hilbert curve, matching
// the layout popularised by xkcd #195 ("Map of the Internet") and used in
// CAIDA / ISI ANT visualisations of the routed IPv4 address space.
//
// Cells are themed via design tokens (no raw colors) so the map adapts to
// every Copland theme. Hover a cell to inspect the /8, its category, and the
// (likely) registry or legacy holder.

import React, { useMemo, useState } from 'react';
import {
  IPV4_ALLOCATIONS,
  CATEGORY_META,
  type Allocation,
  type AllocationCategory,
} from '../lib/internet/ipv4Allocations';

// Hilbert curve: map d ∈ [0, n*n) to (x, y) for n = power of 2.
function d2xy(n: number, d: number): [number, number] {
  let x = 0;
  let y = 0;
  let t = d;
  for (let s = 1; s < n; s *= 2) {
    const rx = 1 & Math.floor(t / 2);
    const ry = 1 & (t ^ rx);
    if (ry === 0) {
      if (rx === 1) {
        x = s - 1 - x;
        y = s - 1 - y;
      }
      const tmp = x;
      x = y;
      y = tmp;
    }
    x += s * rx;
    y += s * ry;
    t = Math.floor(t / 4);
  }
  return [x, y];
}

const N = 16;        // 16×16 = 256 cells = one per /8
const CELL = 11;     // px — keeps the whole map under ~190px wide
const GAP = 1;
const SIZE = N * CELL + (N + 1) * GAP;

interface Cell {
  x: number;
  y: number;
  alloc: Allocation;
}

function buildCells(): Cell[] {
  return IPV4_ALLOCATIONS.map((alloc) => {
    const [x, y] = d2xy(N, alloc.block);
    return { x, y, alloc };
  });
}

function colorVar(cat: AllocationCategory): string {
  return `hsl(var(${CATEGORY_META[cat].varName}))`;
}

export function InternetMap() {
  const cells = useMemo(buildCells, []);
  const [hover, setHover] = useState<Allocation | null>(null);

  // Stable category list for the legend, in display order.
  const legend: AllocationCategory[] = [
    'arin', 'ripe', 'apnic', 'lacnic', 'afrinic',
    'legacy', 'private', 'cgnat', 'loopback', 'multicast', 'reserved',
  ];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          IPv4 Space
        </span>
        <span className="text-[10px] text-muted-foreground font-mono ml-auto">
          256 /8 · Hilbert
        </span>
      </div>

      <div className="copland-inset bg-card p-1.5 flex flex-col items-center gap-1.5">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          shapeRendering="crispEdges"
          role="img"
          aria-label="IPv4 address space map, Hilbert curve of 256 /8 blocks"
          onMouseLeave={() => setHover(null)}
        >
          <rect width={SIZE} height={SIZE} fill="hsl(var(--background))" />
          {cells.map(({ x, y, alloc }) => {
            const isHover = hover?.block === alloc.block;
            return (
              <g key={alloc.block}>
                <rect
                  x={GAP + x * (CELL + GAP)}
                  y={GAP + y * (CELL + GAP)}
                  width={CELL}
                  height={CELL}
                  fill={colorVar(alloc.cat)}
                  fillOpacity={isHover ? 1 : 0.85}
                  stroke={isHover ? 'hsl(var(--foreground))' : 'hsl(var(--border))'}
                  strokeWidth={isHover ? 1 : 0.5}
                  onMouseEnter={() => setHover(alloc)}
                >
                  <title>{`${alloc.cidr} · ${alloc.label}${alloc.org ? ` — ${alloc.org}` : ''}`}</title>
                </rect>
              </g>
            );
          })}
        </svg>

        {/* Hover readout */}
        <div className="w-full text-[10px] font-mono leading-tight min-h-[28px]">
          {hover ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="text-foreground font-bold">{hover.cidr}</span>
                <span
                  className="px-1"
                  style={{ color: colorVar(hover.cat) }}
                >
                  {CATEGORY_META[hover.cat].label}
                </span>
              </div>
              <div className="text-muted-foreground truncate" title={hover.org}>
                {hover.org || hover.label}
              </div>
            </>
          ) : (
            <div className="text-muted-foreground/60 italic">
              hover a /8 block · 1 cell = 16.7M addresses
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] font-mono">
        {legend.map((cat) => (
          <div key={cat} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 border border-border"
              style={{ background: colorVar(cat) }}
            />
            <span className="text-muted-foreground truncate">
              {CATEGORY_META[cat].label}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[9px] text-muted-foreground/60 leading-tight">
        IANA /8 registry · layout per xkcd #195 · cf. CAIDA &amp; ISI ANT IPv4 census
      </p>
    </div>
  );
}
