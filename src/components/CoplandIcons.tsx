// Copland-era pixel-art SVG icons for Gas Town agents and UI elements
// Each theme has its own unique cast of agent characters.

import React, { useEffect, useState } from 'react';

// 16x16 pixel grid SVG wrapper
function PixelIcon({ children, size = 16, className = '' }: { children: React.ReactNode; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      shapeRendering="crispEdges"
      className={className}
    >
      {children}
    </svg>
  );
}

// Helper: draw a pixel rect
function P({ x, y, w = 1, h = 1, fill }: { x: number; y: number; w?: number; h?: number; fill: string }) {
  return <rect x={x} y={y} width={w} height={h} fill={fill} />;
}

// ════════════════════════════════════════════════
// COPLAND theme — Retro animals (Fox, Cat, Raccoon, Weasel)
// ════════════════════════════════════════════════

function CoplandAgent1({ size = 16 }: { size?: number }) {
  // Fox - Rusty
  return (
    <PixelIcon size={size}>
      <P x={3} y={1} fill="hsl(var(--primary))" /><P x={12} y={1} fill="hsl(var(--primary))" />
      <P x={3} y={2} fill="hsl(var(--primary))" /><P x={4} y={2} fill="hsl(var(--primary))" />
      <P x={11} y={2} fill="hsl(var(--primary))" /><P x={12} y={2} fill="hsl(var(--primary))" />
      <P x={4} y={3} w={8} h={1} fill="hsl(var(--primary))" />
      <P x={3} y={4} w={10} h={1} fill="hsl(var(--primary))" />
      <P x={3} y={5} w={10} h={1} fill="hsl(var(--primary))" />
      <P x={5} y={5} fill="hsl(var(--foreground))" /><P x={10} y={5} fill="hsl(var(--foreground))" />
      <P x={3} y={6} w={10} h={1} fill="hsl(var(--primary))" />
      <P x={6} y={6} w={4} h={1} fill="hsl(var(--card))" />
      <P x={4} y={7} w={8} h={1} fill="hsl(var(--primary))" />
      <P x={7} y={7} w={2} h={1} fill="hsl(var(--foreground))" />
      <P x={5} y={8} w={6} h={1} fill="hsl(var(--primary))" />
      <P x={4} y={9} w={8} h={1} fill="hsl(var(--primary))" />
      <P x={4} y={10} w={8} h={1} fill="hsl(var(--card))" />
      <P x={3} y={11} w={10} h={1} fill="hsl(var(--primary))" />
      <P x={4} y={12} w={3} h={1} fill="hsl(var(--foreground))" />
      <P x={9} y={12} w={3} h={1} fill="hsl(var(--foreground))" />
    </PixelIcon>
  );
}

function CoplandAgent2({ size = 16 }: { size?: number }) {
  // Cat - Patches
  return (
    <PixelIcon size={size}>
      <P x={2} y={1} w={2} h={1} fill="hsl(var(--foreground))" />
      <P x={12} y={1} w={2} h={1} fill="hsl(var(--primary))" />
      <P x={2} y={2} w={3} h={1} fill="hsl(var(--foreground))" />
      <P x={11} y={2} w={3} h={1} fill="hsl(var(--primary))" />
      <P x={3} y={3} w={10} h={1} fill="hsl(var(--card))" />
      <P x={2} y={4} w={12} h={1} fill="hsl(var(--card))" />
      <P x={2} y={4} w={4} h={1} fill="hsl(var(--foreground))" />
      <P x={2} y={5} w={12} h={1} fill="hsl(var(--card))" />
      <P x={5} y={5} fill="hsl(var(--terminal-green))" /><P x={10} y={5} fill="hsl(var(--terminal-green))" />
      <P x={3} y={6} w={10} h={1} fill="hsl(var(--card))" />
      <P x={7} y={6} w={2} h={1} fill="hsl(var(--primary))" />
      <P x={4} y={7} w={8} h={1} fill="hsl(var(--card))" />
      <P x={6} y={7} fill="hsl(var(--muted-foreground))" /><P x={9} y={7} fill="hsl(var(--muted-foreground))" />
      <P x={5} y={8} w={6} h={1} fill="hsl(var(--card))" />
      <P x={4} y={9} w={8} h={2} fill="hsl(var(--card))" />
      <P x={4} y={9} w={3} h={2} fill="hsl(var(--primary))" />
      <P x={3} y={11} w={10} h={1} fill="hsl(var(--card))" />
      <P x={4} y={12} w={3} h={1} fill="hsl(var(--foreground))" />
      <P x={9} y={12} w={3} h={1} fill="hsl(var(--foreground))" />
    </PixelIcon>
  );
}

function CoplandAgent3({ size = 16 }: { size?: number }) {
  // Raccoon - Bandit
  return (
    <PixelIcon size={size}>
      <P x={3} y={1} w={2} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={11} y={1} w={2} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={4} y={2} w={8} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={3} y={3} w={10} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={3} y={4} w={10} h={1} fill="hsl(var(--foreground))" />
      <P x={3} y={5} w={10} h={1} fill="hsl(var(--foreground))" />
      <P x={5} y={5} fill="hsl(var(--card))" /><P x={10} y={5} fill="hsl(var(--card))" />
      <P x={4} y={6} w={8} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={7} y={6} w={2} h={1} fill="hsl(var(--foreground))" />
      <P x={5} y={7} w={6} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={4} y={8} w={8} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={4} y={9} w={8} h={2} fill="hsl(var(--muted-foreground))" />
      <P x={6} y={9} w={1} h={2} fill="hsl(var(--foreground))" />
      <P x={9} y={9} w={1} h={2} fill="hsl(var(--foreground))" />
      <P x={3} y={11} w={10} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={4} y={12} w={3} h={1} fill="hsl(var(--foreground))" />
      <P x={9} y={12} w={3} h={1} fill="hsl(var(--foreground))" />
    </PixelIcon>
  );
}

function CoplandAgent4({ size = 16 }: { size?: number }) {
  // Weasel
  return (
    <PixelIcon size={size}>
      <P x={4} y={1} w={2} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={10} y={1} w={2} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={4} y={2} w={8} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={3} y={3} w={10} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={3} y={4} w={10} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={5} y={4} fill="hsl(var(--foreground))" /><P x={10} y={4} fill="hsl(var(--foreground))" />
      <P x={4} y={5} w={8} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={6} y={5} w={4} h={1} fill="hsl(var(--card))" />
      <P x={7} y={5} w={2} h={1} fill="hsl(var(--foreground))" />
      <P x={5} y={6} w={6} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={4} y={7} w={8} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={5} y={7} w={6} h={1} fill="hsl(var(--card))" />
      <P x={4} y={8} w={8} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={5} y={8} w={6} h={1} fill="hsl(var(--card))" />
      <P x={3} y={9} w={10} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={3} y={10} w={10} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={3} y={11} w={10} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={4} y={12} w={3} h={1} fill="hsl(var(--foreground))" />
      <P x={9} y={12} w={3} h={1} fill="hsl(var(--foreground))" />
    </PixelIcon>
  );
}

// ════════════════════════════════════════════════
// SHADCN theme — Geometric robots (Circle, Square, Diamond, Hex)
// ════════════════════════════════════════════════

function ShadcnAgent1({ size = 16 }: { size?: number }) {
  // Circle bot
  return (
    <PixelIcon size={size}>
      <P x={5} y={1} w={6} h={1} fill="hsl(var(--primary))" />
      <P x={3} y={2} w={10} h={1} fill="hsl(var(--primary))" />
      <P x={2} y={3} w={12} h={1} fill="hsl(var(--primary))" />
      <P x={2} y={4} w={12} h={1} fill="hsl(var(--primary))" />
      <P x={5} y={4} w={2} h={1} fill="hsl(var(--card))" />
      <P x={9} y={4} w={2} h={1} fill="hsl(var(--card))" />
      <P x={2} y={5} w={12} h={1} fill="hsl(var(--primary))" />
      <P x={2} y={6} w={12} h={1} fill="hsl(var(--primary))" />
      <P x={6} y={6} w={4} h={1} fill="hsl(var(--card))" />
      <P x={3} y={7} w={10} h={1} fill="hsl(var(--primary))" />
      <P x={5} y={8} w={6} h={1} fill="hsl(var(--primary))" />
      {/* Antenna */}
      <P x={7} y={0} w={2} h={1} fill="hsl(var(--terminal-cyan))" />
      {/* Body */}
      <P x={4} y={9} w={8} h={1} fill="hsl(var(--secondary))" />
      <P x={4} y={10} w={8} h={2} fill="hsl(var(--secondary))" />
      <P x={6} y={10} w={4} h={1} fill="hsl(var(--primary))" />
      <P x={5} y={12} w={2} h={1} fill="hsl(var(--foreground))" />
      <P x={9} y={12} w={2} h={1} fill="hsl(var(--foreground))" />
    </PixelIcon>
  );
}

function ShadcnAgent2({ size = 16 }: { size?: number }) {
  // Square bot
  return (
    <PixelIcon size={size}>
      <P x={3} y={2} w={10} h={1} fill="hsl(var(--primary))" />
      <P x={3} y={3} w={10} h={6} fill="hsl(var(--primary))" />
      <P x={5} y={4} w={2} h={2} fill="hsl(var(--terminal-green))" />
      <P x={9} y={4} w={2} h={2} fill="hsl(var(--terminal-green))" />
      <P x={6} y={7} w={4} h={1} fill="hsl(var(--card))" />
      {/* Body */}
      <P x={4} y={9} w={8} h={1} fill="hsl(var(--secondary))" />
      <P x={5} y={10} w={6} h={2} fill="hsl(var(--secondary))" />
      <P x={7} y={10} w={2} h={1} fill="hsl(var(--terminal-green))" />
      <P x={5} y={12} w={2} h={1} fill="hsl(var(--foreground))" />
      <P x={9} y={12} w={2} h={1} fill="hsl(var(--foreground))" />
      {/* Arms */}
      <P x={1} y={10} w={3} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={12} y={10} w={3} h={1} fill="hsl(var(--muted-foreground))" />
    </PixelIcon>
  );
}

function ShadcnAgent3({ size = 16 }: { size?: number }) {
  // Diamond bot
  return (
    <PixelIcon size={size}>
      <P x={7} y={1} w={2} h={1} fill="hsl(var(--primary))" />
      <P x={6} y={2} w={4} h={1} fill="hsl(var(--primary))" />
      <P x={5} y={3} w={6} h={1} fill="hsl(var(--primary))" />
      <P x={4} y={4} w={8} h={1} fill="hsl(var(--primary))" />
      <P x={3} y={5} w={10} h={1} fill="hsl(var(--primary))" />
      <P x={5} y={5} w={2} h={1} fill="hsl(var(--card))" />
      <P x={9} y={5} w={2} h={1} fill="hsl(var(--card))" />
      <P x={4} y={6} w={8} h={1} fill="hsl(var(--primary))" />
      <P x={5} y={7} w={6} h={1} fill="hsl(var(--primary))" />
      <P x={6} y={8} w={4} h={1} fill="hsl(var(--primary))" />
      {/* Body */}
      <P x={5} y={9} w={6} h={1} fill="hsl(var(--secondary))" />
      <P x={5} y={10} w={6} h={2} fill="hsl(var(--secondary))" />
      <P x={5} y={12} w={2} h={1} fill="hsl(var(--foreground))" />
      <P x={9} y={12} w={2} h={1} fill="hsl(var(--foreground))" />
    </PixelIcon>
  );
}

function ShadcnAgent4({ size = 16 }: { size?: number }) {
  // Hex bot
  return (
    <PixelIcon size={size}>
      <P x={5} y={1} w={6} h={1} fill="hsl(var(--primary))" />
      <P x={3} y={2} w={10} h={1} fill="hsl(var(--primary))" />
      <P x={2} y={3} w={12} h={1} fill="hsl(var(--primary))" />
      <P x={2} y={4} w={12} h={1} fill="hsl(var(--primary))" />
      <P x={5} y={4} fill="hsl(var(--terminal-amber))" /><P x={10} y={4} fill="hsl(var(--terminal-amber))" />
      <P x={2} y={5} w={12} h={1} fill="hsl(var(--primary))" />
      <P x={6} y={5} w={4} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={3} y={6} w={10} h={1} fill="hsl(var(--primary))" />
      <P x={5} y={7} w={6} h={1} fill="hsl(var(--primary))" />
      {/* Body */}
      <P x={4} y={8} w={8} h={1} fill="hsl(var(--secondary))" />
      <P x={3} y={9} w={10} h={3} fill="hsl(var(--secondary))" />
      <P x={6} y={10} w={4} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={4} y={12} w={3} h={1} fill="hsl(var(--foreground))" />
      <P x={9} y={12} w={3} h={1} fill="hsl(var(--foreground))" />
    </PixelIcon>
  );
}

// ════════════════════════════════════════════════
// ROSÉ PINE — Botanical sprites (Rose, Fern, Mushroom, Butterfly)
// ════════════════════════════════════════════════

function RosePineAgent1({ size = 16 }: { size?: number }) {
  // Rose flower
  return (
    <PixelIcon size={size}>
      <P x={7} y={1} w={2} h={1} fill="hsl(var(--primary))" />
      <P x={5} y={2} w={6} h={1} fill="hsl(var(--primary))" />
      <P x={4} y={3} w={8} h={1} fill="hsl(var(--primary))" />
      <P x={3} y={4} w={10} h={2} fill="hsl(var(--primary))" />
      <P x={6} y={4} w={4} h={1} fill="hsl(var(--card))" />
      <P x={4} y={6} w={8} h={1} fill="hsl(var(--primary))" />
      <P x={5} y={7} w={6} h={1} fill="hsl(var(--primary))" />
      {/* Stem */}
      <P x={7} y={8} w={2} h={1} fill="hsl(var(--terminal-green))" />
      <P x={7} y={9} w={2} h={1} fill="hsl(var(--terminal-green))" />
      {/* Leaves */}
      <P x={5} y={9} w={2} h={1} fill="hsl(var(--terminal-green))" />
      <P x={10} y={10} w={2} h={1} fill="hsl(var(--terminal-green))" />
      <P x={7} y={10} w={2} h={1} fill="hsl(var(--terminal-green))" />
      <P x={7} y={11} w={2} h={1} fill="hsl(var(--terminal-green))" />
      {/* Pot */}
      <P x={5} y={12} w={6} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={6} y={13} w={4} h={1} fill="hsl(var(--terminal-amber))" />
    </PixelIcon>
  );
}

function RosePineAgent2({ size = 16 }: { size?: number }) {
  // Fern sprite
  return (
    <PixelIcon size={size}>
      <P x={7} y={1} w={2} h={1} fill="hsl(var(--terminal-green))" />
      <P x={6} y={2} w={4} h={1} fill="hsl(var(--terminal-green))" />
      <P x={4} y={3} w={2} h={1} fill="hsl(var(--terminal-green))" />
      <P x={7} y={3} w={2} h={1} fill="hsl(var(--terminal-green))" />
      <P x={10} y={3} w={2} h={1} fill="hsl(var(--terminal-green))" />
      <P x={3} y={4} w={3} h={1} fill="hsl(var(--terminal-green))" />
      <P x={7} y={4} w={2} h={1} fill="hsl(var(--terminal-green))" />
      <P x={10} y={4} w={3} h={1} fill="hsl(var(--terminal-green))" />
      <P x={7} y={5} w={2} h={1} fill="hsl(var(--terminal-green))" />
      <P x={4} y={6} w={2} h={1} fill="hsl(var(--terminal-green))" />
      <P x={7} y={6} w={2} h={1} fill="hsl(var(--terminal-green))" />
      <P x={10} y={6} w={2} h={1} fill="hsl(var(--terminal-green))" />
      <P x={3} y={7} w={3} h={1} fill="hsl(var(--terminal-green))" />
      <P x={7} y={7} w={2} h={1} fill="hsl(var(--terminal-green))" />
      <P x={10} y={7} w={3} h={1} fill="hsl(var(--terminal-green))" />
      <P x={7} y={8} w={2} h={3} fill="hsl(var(--terminal-green))" />
      {/* Eyes on the fern - it's a sprite! */}
      <P x={6} y={5} fill="hsl(var(--foreground))" /><P x={9} y={5} fill="hsl(var(--foreground))" />
      {/* Pot */}
      <P x={5} y={11} w={6} h={1} fill="hsl(var(--primary))" />
      <P x={5} y={12} w={6} h={1} fill="hsl(var(--primary))" />
      <P x={6} y={13} w={4} h={1} fill="hsl(var(--primary))" />
    </PixelIcon>
  );
}

function RosePineAgent3({ size = 16 }: { size?: number }) {
  // Mushroom
  return (
    <PixelIcon size={size}>
      <P x={6} y={1} w={4} h={1} fill="hsl(var(--terminal-red))" />
      <P x={4} y={2} w={8} h={1} fill="hsl(var(--terminal-red))" />
      <P x={3} y={3} w={10} h={1} fill="hsl(var(--terminal-red))" />
      {/* Spots */}
      <P x={5} y={3} fill="hsl(var(--card))" /><P x={10} y={3} fill="hsl(var(--card))" />
      <P x={2} y={4} w={12} h={1} fill="hsl(var(--terminal-red))" />
      <P x={4} y={4} fill="hsl(var(--card))" /><P x={8} y={4} fill="hsl(var(--card))" /><P x={11} y={4} fill="hsl(var(--card))" />
      <P x={3} y={5} w={10} h={1} fill="hsl(var(--terminal-red))" />
      <P x={4} y={6} w={8} h={1} fill="hsl(var(--terminal-red))" />
      {/* Face */}
      <P x={5} y={5} fill="hsl(var(--foreground))" /><P x={10} y={5} fill="hsl(var(--foreground))" />
      {/* Stem */}
      <P x={6} y={7} w={4} h={1} fill="hsl(var(--card))" />
      <P x={6} y={8} w={4} h={1} fill="hsl(var(--card))" />
      <P x={6} y={9} w={4} h={2} fill="hsl(var(--card))" />
      <P x={5} y={11} w={6} h={1} fill="hsl(var(--card))" />
      {/* Ground */}
      <P x={3} y={12} w={10} h={1} fill="hsl(var(--terminal-green))" />
    </PixelIcon>
  );
}

function RosePineAgent4({ size = 16 }: { size?: number }) {
  // Butterfly
  return (
    <PixelIcon size={size}>
      {/* Upper wings */}
      <P x={3} y={2} w={3} h={1} fill="hsl(var(--primary))" />
      <P x={10} y={2} w={3} h={1} fill="hsl(var(--primary))" />
      <P x={2} y={3} w={4} h={2} fill="hsl(var(--primary))" />
      <P x={10} y={3} w={4} h={2} fill="hsl(var(--primary))" />
      <P x={3} y={3} fill="hsl(var(--card))" /><P x={12} y={3} fill="hsl(var(--card))" />
      {/* Body */}
      <P x={7} y={2} w={2} h={1} fill="hsl(var(--foreground))" />
      <P x={7} y={3} w={2} h={1} fill="hsl(var(--foreground))" />
      <P x={7} y={4} w={2} h={1} fill="hsl(var(--foreground))" />
      <P x={7} y={5} w={2} h={1} fill="hsl(var(--foreground))" />
      {/* Lower wings */}
      <P x={3} y={5} w={3} h={2} fill="hsl(var(--terminal-amber))" />
      <P x={10} y={5} w={3} h={2} fill="hsl(var(--terminal-amber))" />
      <P x={4} y={7} w={2} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={10} y={7} w={2} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={7} y={6} w={2} h={1} fill="hsl(var(--foreground))" />
      <P x={7} y={7} w={2} h={1} fill="hsl(var(--foreground))" />
      <P x={7} y={8} w={2} h={1} fill="hsl(var(--foreground))" />
      {/* Antennae */}
      <P x={6} y={1} fill="hsl(var(--foreground))" /><P x={9} y={1} fill="hsl(var(--foreground))" />
    </PixelIcon>
  );
}

// ════════════════════════════════════════════════
// CATPPUCCIN — Cat variants (Tabby, Siamese, Tuxedo, Calico)
// ════════════════════════════════════════════════

function CatppuccinAgent1({ size = 16 }: { size?: number }) {
  // Tabby cat
  return (
    <PixelIcon size={size}>
      <P x={3} y={1} w={2} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={11} y={1} w={2} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={3} y={2} w={3} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={10} y={2} w={3} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={3} y={3} w={10} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={3} y={4} w={10} h={1} fill="hsl(var(--terminal-amber))" />
      {/* Stripes */}
      <P x={4} y={3} w={1} h={2} fill="hsl(var(--foreground))" />
      <P x={7} y={3} w={2} h={1} fill="hsl(var(--foreground))" />
      <P x={11} y={3} w={1} h={2} fill="hsl(var(--foreground))" />
      {/* Eyes */}
      <P x={5} y={5} fill="hsl(var(--terminal-green))" /><P x={10} y={5} fill="hsl(var(--terminal-green))" />
      <P x={3} y={5} w={10} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={5} y={5} fill="hsl(var(--terminal-green))" /><P x={10} y={5} fill="hsl(var(--terminal-green))" />
      <P x={3} y={6} w={10} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={7} y={6} w={2} h={1} fill="hsl(var(--primary))" />
      <P x={4} y={7} w={8} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={6} y={7} fill="hsl(var(--muted-foreground))" /><P x={9} y={7} fill="hsl(var(--muted-foreground))" />
      <P x={5} y={8} w={6} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={4} y={9} w={8} h={2} fill="hsl(var(--terminal-amber))" />
      <P x={3} y={11} w={10} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={4} y={12} w={3} h={1} fill="hsl(var(--foreground))" />
      <P x={9} y={12} w={3} h={1} fill="hsl(var(--foreground))" />
    </PixelIcon>
  );
}

function CatppuccinAgent2({ size = 16 }: { size?: number }) {
  // Siamese cat
  return (
    <PixelIcon size={size}>
      <P x={3} y={1} w={2} h={1} fill="hsl(var(--foreground))" />
      <P x={11} y={1} w={2} h={1} fill="hsl(var(--foreground))" />
      <P x={3} y={2} w={3} h={1} fill="hsl(var(--foreground))" />
      <P x={10} y={2} w={3} h={1} fill="hsl(var(--foreground))" />
      <P x={3} y={3} w={10} h={1} fill="hsl(var(--card))" />
      <P x={3} y={4} w={10} h={1} fill="hsl(var(--card))" />
      <P x={3} y={5} w={10} h={1} fill="hsl(var(--card))" />
      <P x={5} y={5} fill="hsl(var(--terminal-cyan))" /><P x={10} y={5} fill="hsl(var(--terminal-cyan))" />
      <P x={3} y={6} w={10} h={1} fill="hsl(var(--foreground))" />
      <P x={7} y={6} w={2} h={1} fill="hsl(var(--card))" />
      <P x={4} y={7} w={8} h={1} fill="hsl(var(--card))" />
      <P x={5} y={8} w={6} h={1} fill="hsl(var(--card))" />
      <P x={4} y={9} w={8} h={2} fill="hsl(var(--card))" />
      <P x={3} y={11} w={10} h={1} fill="hsl(var(--card))" />
      {/* Dark points (feet, tail) */}
      <P x={4} y={12} w={3} h={1} fill="hsl(var(--foreground))" />
      <P x={9} y={12} w={3} h={1} fill="hsl(var(--foreground))" />
      <P x={13} y={10} w={1} h={2} fill="hsl(var(--foreground))" />
    </PixelIcon>
  );
}

function CatppuccinAgent3({ size = 16 }: { size?: number }) {
  // Tuxedo cat
  return (
    <PixelIcon size={size}>
      <P x={3} y={1} w={2} h={1} fill="hsl(var(--foreground))" />
      <P x={11} y={1} w={2} h={1} fill="hsl(var(--foreground))" />
      <P x={3} y={2} w={3} h={1} fill="hsl(var(--foreground))" />
      <P x={10} y={2} w={3} h={1} fill="hsl(var(--foreground))" />
      <P x={3} y={3} w={10} h={1} fill="hsl(var(--foreground))" />
      <P x={3} y={4} w={10} h={1} fill="hsl(var(--foreground))" />
      <P x={3} y={5} w={10} h={1} fill="hsl(var(--foreground))" />
      <P x={5} y={5} fill="hsl(var(--terminal-amber))" /><P x={10} y={5} fill="hsl(var(--terminal-amber))" />
      <P x={3} y={6} w={10} h={1} fill="hsl(var(--foreground))" />
      <P x={7} y={6} w={2} h={1} fill="hsl(var(--card))" />
      <P x={4} y={7} w={8} h={1} fill="hsl(var(--foreground))" />
      {/* White chest */}
      <P x={5} y={8} w={6} h={1} fill="hsl(var(--foreground))" />
      <P x={6} y={8} w={4} h={1} fill="hsl(var(--card))" />
      <P x={4} y={9} w={8} h={2} fill="hsl(var(--foreground))" />
      <P x={6} y={9} w={4} h={2} fill="hsl(var(--card))" />
      <P x={3} y={11} w={10} h={1} fill="hsl(var(--foreground))" />
      <P x={4} y={12} w={3} h={1} fill="hsl(var(--foreground))" />
      <P x={9} y={12} w={3} h={1} fill="hsl(var(--foreground))" />
    </PixelIcon>
  );
}

function CatppuccinAgent4({ size = 16 }: { size?: number }) {
  // Calico cat
  return (
    <PixelIcon size={size}>
      <P x={3} y={1} w={2} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={11} y={1} w={2} h={1} fill="hsl(var(--primary))" />
      <P x={3} y={2} w={3} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={10} y={2} w={3} h={1} fill="hsl(var(--primary))" />
      <P x={3} y={3} w={5} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={8} y={3} w={5} h={1} fill="hsl(var(--card))" />
      <P x={3} y={4} w={4} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={7} y={4} w={6} h={1} fill="hsl(var(--card))" />
      <P x={3} y={5} w={10} h={1} fill="hsl(var(--card))" />
      <P x={5} y={5} fill="hsl(var(--terminal-green))" /><P x={10} y={5} fill="hsl(var(--terminal-green))" />
      <P x={3} y={6} w={10} h={1} fill="hsl(var(--card))" />
      <P x={7} y={6} w={2} h={1} fill="hsl(var(--primary))" />
      <P x={4} y={7} w={8} h={1} fill="hsl(var(--card))" />
      <P x={5} y={8} w={6} h={1} fill="hsl(var(--card))" />
      <P x={4} y={9} w={3} h={2} fill="hsl(var(--terminal-amber))" />
      <P x={7} y={9} w={2} h={2} fill="hsl(var(--card))" />
      <P x={9} y={9} w={3} h={2} fill="hsl(var(--primary))" />
      <P x={3} y={11} w={10} h={1} fill="hsl(var(--card))" />
      <P x={4} y={12} w={3} h={1} fill="hsl(var(--foreground))" />
      <P x={9} y={12} w={3} h={1} fill="hsl(var(--foreground))" />
    </PixelIcon>
  );
}

// ════════════════════════════════════════════════
// NORD — Arctic animals (Polar Bear, Penguin, Wolf, Owl)
// ════════════════════════════════════════════════

function NordAgent1({ size = 16 }: { size?: number }) {
  // Polar bear
  return (
    <PixelIcon size={size}>
      <P x={3} y={1} w={2} h={2} fill="hsl(var(--card))" />
      <P x={11} y={1} w={2} h={2} fill="hsl(var(--card))" />
      <P x={4} y={3} w={8} h={1} fill="hsl(var(--card))" />
      <P x={3} y={4} w={10} h={1} fill="hsl(var(--card))" />
      <P x={3} y={5} w={10} h={1} fill="hsl(var(--card))" />
      <P x={5} y={5} fill="hsl(var(--foreground))" /><P x={10} y={5} fill="hsl(var(--foreground))" />
      <P x={3} y={6} w={10} h={1} fill="hsl(var(--card))" />
      <P x={7} y={6} w={2} h={1} fill="hsl(var(--foreground))" />
      <P x={4} y={7} w={8} h={1} fill="hsl(var(--card))" />
      <P x={4} y={8} w={8} h={1} fill="hsl(var(--card))" />
      <P x={3} y={9} w={10} h={3} fill="hsl(var(--card))" />
      <P x={4} y={12} w={3} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={9} y={12} w={3} h={1} fill="hsl(var(--muted-foreground))" />
    </PixelIcon>
  );
}

function NordAgent2({ size = 16 }: { size?: number }) {
  // Penguin
  return (
    <PixelIcon size={size}>
      <P x={5} y={1} w={6} h={1} fill="hsl(var(--foreground))" />
      <P x={4} y={2} w={8} h={1} fill="hsl(var(--foreground))" />
      <P x={3} y={3} w={10} h={1} fill="hsl(var(--foreground))" />
      <P x={3} y={4} w={10} h={1} fill="hsl(var(--foreground))" />
      <P x={5} y={4} fill="hsl(var(--card))" /><P x={10} y={4} fill="hsl(var(--card))" />
      <P x={3} y={5} w={10} h={1} fill="hsl(var(--foreground))" />
      <P x={6} y={5} w={4} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={3} y={6} w={2} h={1} fill="hsl(var(--foreground))" />
      <P x={11} y={6} w={2} h={1} fill="hsl(var(--foreground))" />
      {/* White belly */}
      <P x={5} y={6} w={6} h={1} fill="hsl(var(--card))" />
      <P x={4} y={7} w={8} h={1} fill="hsl(var(--foreground))" />
      <P x={5} y={7} w={6} h={1} fill="hsl(var(--card))" />
      <P x={4} y={8} w={8} h={1} fill="hsl(var(--foreground))" />
      <P x={5} y={8} w={6} h={1} fill="hsl(var(--card))" />
      <P x={4} y={9} w={8} h={2} fill="hsl(var(--foreground))" />
      <P x={5} y={9} w={6} h={2} fill="hsl(var(--card))" />
      <P x={4} y={11} w={8} h={1} fill="hsl(var(--foreground))" />
      {/* Feet */}
      <P x={4} y={12} w={3} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={9} y={12} w={3} h={1} fill="hsl(var(--terminal-amber))" />
    </PixelIcon>
  );
}

function NordAgent3({ size = 16 }: { size?: number }) {
  // Wolf
  return (
    <PixelIcon size={size}>
      <P x={2} y={1} w={2} h={2} fill="hsl(var(--muted-foreground))" />
      <P x={12} y={1} w={2} h={2} fill="hsl(var(--muted-foreground))" />
      <P x={3} y={3} w={10} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={3} y={4} w={10} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={3} y={5} w={10} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={5} y={5} fill="hsl(var(--terminal-cyan))" /><P x={10} y={5} fill="hsl(var(--terminal-cyan))" />
      <P x={3} y={6} w={10} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={6} y={6} w={4} h={1} fill="hsl(var(--card))" />
      <P x={4} y={7} w={8} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={7} y={7} w={2} h={1} fill="hsl(var(--foreground))" />
      <P x={5} y={8} w={6} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={4} y={9} w={8} h={2} fill="hsl(var(--muted-foreground))" />
      <P x={6} y={9} w={4} h={1} fill="hsl(var(--card))" />
      <P x={3} y={11} w={10} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={4} y={12} w={3} h={1} fill="hsl(var(--foreground))" />
      <P x={9} y={12} w={3} h={1} fill="hsl(var(--foreground))" />
    </PixelIcon>
  );
}

function NordAgent4({ size = 16 }: { size?: number }) {
  // Owl
  return (
    <PixelIcon size={size}>
      {/* Ear tufts */}
      <P x={3} y={1} w={2} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={11} y={1} w={2} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={4} y={2} w={8} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={3} y={3} w={10} h={1} fill="hsl(var(--muted-foreground))" />
      {/* Big eyes */}
      <P x={3} y={4} w={10} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={4} y={4} w={3} h={2} fill="hsl(var(--terminal-amber))" />
      <P x={9} y={4} w={3} h={2} fill="hsl(var(--terminal-amber))" />
      <P x={5} y={5} fill="hsl(var(--foreground))" /><P x={10} y={5} fill="hsl(var(--foreground))" />
      <P x={3} y={5} w={1} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={12} y={5} w={1} h={1} fill="hsl(var(--muted-foreground))" />
      {/* Beak */}
      <P x={3} y={6} w={10} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={7} y={6} w={2} h={1} fill="hsl(var(--terminal-amber))" />
      {/* Body */}
      <P x={4} y={7} w={8} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={4} y={8} w={8} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={6} y={8} w={4} h={1} fill="hsl(var(--card))" />
      {/* Wings */}
      <P x={2} y={8} w={2} h={2} fill="hsl(var(--muted-foreground))" />
      <P x={12} y={8} w={2} h={2} fill="hsl(var(--muted-foreground))" />
      <P x={4} y={9} w={8} h={2} fill="hsl(var(--muted-foreground))" />
      <P x={6} y={9} w={4} h={2} fill="hsl(var(--card))" />
      <P x={4} y={11} w={8} h={1} fill="hsl(var(--muted-foreground))" />
      {/* Feet */}
      <P x={5} y={12} w={2} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={9} y={12} w={2} h={1} fill="hsl(var(--terminal-amber))" />
    </PixelIcon>
  );
}

// ════════════════════════════════════════════════
// Theme → Icon mapping
// ════════════════════════════════════════════════

type AgentSet = [React.FC<{ size?: number }>, React.FC<{ size?: number }>, React.FC<{ size?: number }>, React.FC<{ size?: number }>];

const themeAgents: Record<string, { agents: AgentSet; names: [string, string, string, string] }> = {
  copland: {
    agents: [CoplandAgent1, CoplandAgent2, CoplandAgent3, CoplandAgent4],
    names: ['Rusty', 'Patches', 'Bandit', 'Weasel'],
  },
  shadcn: {
    agents: [ShadcnAgent1, ShadcnAgent2, ShadcnAgent3, ShadcnAgent4],
    names: ['Orb', 'Cube', 'Prism', 'Hexa'],
  },
  'rose-pine': {
    agents: [RosePineAgent1, RosePineAgent2, RosePineAgent3, RosePineAgent4],
    names: ['Rose', 'Fern', 'Shroom', 'Flutter'],
  },
  catppuccin: {
    agents: [CatppuccinAgent1, CatppuccinAgent2, CatppuccinAgent3, CatppuccinAgent4],
    names: ['Tabby', 'Siam', 'Tux', 'Cali'],
  },
  nord: {
    agents: [NordAgent1, NordAgent2, NordAgent3, NordAgent4],
    names: ['Bjorn', 'Pip', 'Fenrir', 'Huginn'],
  },
};

// Hook to get current theme ID
function useThemeId(): string {
  const [themeId, setThemeId] = useState(() => localStorage.getItem('theme-id') || 'copland');

  useEffect(() => {
    // Listen for theme changes via storage event and a custom event
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'theme-id' && e.newValue) setThemeId(e.newValue);
    };
    const onCustom = () => {
      setThemeId(localStorage.getItem('theme-id') || 'copland');
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('theme-changed', onCustom);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('theme-changed', onCustom);
    };
  }, []);

  return themeId;
}

// Get the agent names for the current theme
export function useThemeAgentNames(): string[] {
  const themeId = useThemeId();
  return (themeAgents[themeId] || themeAgents.copland).names;
}

// ── Public Agent Icon (theme-aware) ──

export function AgentIcon({ name, size = 16 }: { name: string; size?: number }) {
  const themeId = useThemeId();
  const set = themeAgents[themeId] || themeAgents.copland;

  // Match by position: the agent names from the actor system are always
  // Rusty/Patches/Bandit/Weasel, so map them to theme-specific icons by index.
  const canonicalNames = themeAgents.copland.names;
  const idx = canonicalNames.indexOf(name);
  if (idx >= 0) {
    const IconComponent = set.agents[idx];
    return <IconComponent size={size} />;
  }

  // Fallback: generic pixel agent
  return (
    <PixelIcon size={size}>
      <P x={5} y={2} w={6} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={4} y={3} w={8} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={4} y={4} w={8} h={2} fill="hsl(var(--muted-foreground))" />
      <P x={6} y={4} fill="hsl(var(--foreground))" /><P x={9} y={4} fill="hsl(var(--foreground))" />
      <P x={5} y={6} w={6} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={4} y={7} w={8} h={4} fill="hsl(var(--muted-foreground))" />
      <P x={4} y={11} w={3} h={1} fill="hsl(var(--foreground))" />
      <P x={9} y={11} w={3} h={1} fill="hsl(var(--foreground))" />
    </PixelIcon>
  );
}

// Legacy named exports for backwards compat
export const AgentRusty = CoplandAgent1;
export const AgentPatches = CoplandAgent2;
export const AgentBandit = CoplandAgent3;
export const AgentWeasel = CoplandAgent4;

// ── UI Chrome Icons (Mac OS Copland style) ──

export function WindowCloseBox({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" shapeRendering="crispEdges">
      <rect x={0} y={0} width={12} height={12} fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth={1} />
      <rect x={1} y={1} width={10} height={1} fill="hsl(var(--border))" />
      <rect x={1} y={1} width={1} height={10} fill="hsl(var(--border))" />
    </svg>
  );
}

export function WindowZoomBox({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" shapeRendering="crispEdges">
      <rect x={0} y={0} width={12} height={12} fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth={1} />
      <rect x={3} y={3} width={6} height={6} fill="none" stroke="hsl(var(--foreground))" strokeWidth={1} />
    </svg>
  );
}

export function PixelFolder({ size = 16 }: { size?: number }) {
  return (
    <PixelIcon size={size}>
      <P x={1} y={3} w={5} h={1} fill="hsl(var(--primary))" />
      <P x={1} y={4} w={14} h={1} fill="hsl(var(--primary))" />
      <P x={1} y={5} w={14} h={8} fill="hsl(var(--accent))" />
      <rect x={1} y={4} width={14} height={9} fill="none" stroke="hsl(var(--foreground))" strokeWidth={0.5} />
    </PixelIcon>
  );
}

export function PixelGear({ size = 16 }: { size?: number }) {
  return (
    <PixelIcon size={size}>
      <P x={6} y={1} w={4} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={6} y={14} w={4} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={1} y={6} w={1} h={4} fill="hsl(var(--muted-foreground))" />
      <P x={14} y={6} w={1} h={4} fill="hsl(var(--muted-foreground))" />
      <P x={3} y={3} w={2} h={2} fill="hsl(var(--muted-foreground))" />
      <P x={11} y={3} w={2} h={2} fill="hsl(var(--muted-foreground))" />
      <P x={3} y={11} w={2} h={2} fill="hsl(var(--muted-foreground))" />
      <P x={11} y={11} w={2} h={2} fill="hsl(var(--muted-foreground))" />
      <P x={4} y={4} w={8} h={8} fill="hsl(var(--muted-foreground))" />
      <P x={5} y={5} w={6} h={6} fill="hsl(var(--card))" />
      <P x={6} y={6} w={4} h={4} fill="hsl(var(--muted-foreground))" />
    </PixelIcon>
  );
}

export function PixelChip({ size = 16 }: { size?: number }) {
  return (
    <PixelIcon size={size}>
      <P x={4} y={1} w={1} h={2} fill="hsl(var(--muted-foreground))" />
      <P x={7} y={1} w={1} h={2} fill="hsl(var(--muted-foreground))" />
      <P x={10} y={1} w={1} h={2} fill="hsl(var(--muted-foreground))" />
      <P x={4} y={13} w={1} h={2} fill="hsl(var(--muted-foreground))" />
      <P x={7} y={13} w={1} h={2} fill="hsl(var(--muted-foreground))" />
      <P x={10} y={13} w={1} h={2} fill="hsl(var(--muted-foreground))" />
      <P x={1} y={5} w={2} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={1} y={8} w={2} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={1} y={11} w={2} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={13} y={5} w={2} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={13} y={8} w={2} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={13} y={11} w={2} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={3} y={3} w={10} h={10} fill="hsl(var(--secondary))" />
      <rect x={3} y={3} width={10} height={10} fill="none" stroke="hsl(var(--foreground))" strokeWidth={0.5} />
      <P x={5} y={5} w={6} h={6} fill="hsl(var(--primary))" />
    </PixelIcon>
  );
}

export function PixelShield({ size = 16 }: { size?: number }) {
  return (
    <PixelIcon size={size}>
      <P x={7} y={1} w={2} h={1} fill="hsl(var(--primary))" />
      <P x={5} y={2} w={6} h={1} fill="hsl(var(--primary))" />
      <P x={3} y={3} w={10} h={1} fill="hsl(var(--primary))" />
      <P x={2} y={4} w={12} h={3} fill="hsl(var(--primary))" />
      <P x={3} y={7} w={10} h={2} fill="hsl(var(--primary))" />
      <P x={4} y={9} w={8} h={1} fill="hsl(var(--primary))" />
      <P x={5} y={10} w={6} h={1} fill="hsl(var(--primary))" />
      <P x={6} y={11} w={4} h={1} fill="hsl(var(--primary))" />
      <P x={7} y={12} w={2} h={1} fill="hsl(var(--primary))" />
      <P x={7} y={5} w={2} h={1} fill="hsl(var(--card))" />
      <P x={6} y={6} w={4} h={1} fill="hsl(var(--card))" />
      <P x={7} y={7} w={2} h={1} fill="hsl(var(--card))" />
    </PixelIcon>
  );
}

export function PixelChart({ size = 16 }: { size?: number }) {
  return (
    <PixelIcon size={size}>
      <P x={2} y={2} w={1} h={12} fill="hsl(var(--foreground))" />
      <P x={2} y={13} w={12} h={1} fill="hsl(var(--foreground))" />
      <P x={4} y={10} w={2} h={3} fill="hsl(var(--primary))" />
      <P x={7} y={6} w={2} h={7} fill="hsl(var(--terminal-amber))" />
      <P x={10} y={4} w={2} h={9} fill="hsl(var(--terminal-green))" />
    </PixelIcon>
  );
}

// ── Copland Window Title Bar ──
export function CoplandTitleBar({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-b from-[hsl(var(--secondary))] to-[hsl(var(--muted))] border-b border-[hsl(var(--border))]"
      style={{
        backgroundImage: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 1px,
          hsl(var(--border) / 0.3) 1px,
          hsl(var(--border) / 0.3) 2px
        )`
      }}
    >
      <WindowCloseBox size={11} />
      <span className="flex-1 text-[10px] font-bold text-foreground uppercase tracking-wider truncate px-1">
        {title}
      </span>
      {children}
      <WindowZoomBox size={11} />
    </div>
  );
}

// ── Copland Window Frame ──
export function CoplandWindow({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`border border-[hsl(var(--foreground)/0.2)] bg-card shadow-[1px_1px_0_0_hsl(var(--foreground)/0.1),-1px_-1px_0_0_hsl(var(--card))] ${className}`}>
      <CoplandTitleBar title={title} />
      <div className="p-2">
        {children}
      </div>
    </div>
  );
}
