// Copland-era pixel-art SVG icons for Gas Town agents and UI elements

import React from 'react';

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

// ── Agent Icons (Copland-style bitmap characters) ──

export function AgentRusty({ size = 16 }: { size?: number }) {
  // Fox/ferret face - warm orange
  return (
    <PixelIcon size={size}>
      {/* Ears */}
      <P x={3} y={1} fill="hsl(var(--primary))" /><P x={12} y={1} fill="hsl(var(--primary))" />
      <P x={3} y={2} fill="hsl(var(--primary))" /><P x={4} y={2} fill="hsl(var(--primary))" />
      <P x={11} y={2} fill="hsl(var(--primary))" /><P x={12} y={2} fill="hsl(var(--primary))" />
      {/* Head */}
      <P x={4} y={3} w={8} h={1} fill="hsl(var(--primary))" />
      <P x={3} y={4} w={10} h={1} fill="hsl(var(--primary))" />
      <P x={3} y={5} w={10} h={1} fill="hsl(var(--primary))" />
      {/* Eyes */}
      <P x={5} y={5} fill="hsl(var(--foreground))" /><P x={10} y={5} fill="hsl(var(--foreground))" />
      {/* Snout */}
      <P x={3} y={6} w={10} h={1} fill="hsl(var(--primary))" />
      <P x={6} y={6} w={4} h={1} fill="hsl(var(--card))" />
      <P x={4} y={7} w={8} h={1} fill="hsl(var(--primary))" />
      <P x={7} y={7} w={2} h={1} fill="hsl(var(--foreground))" />
      {/* Body */}
      <P x={5} y={8} w={6} h={1} fill="hsl(var(--primary))" />
      <P x={4} y={9} w={8} h={1} fill="hsl(var(--primary))" />
      <P x={4} y={10} w={8} h={1} fill="hsl(var(--card))" />
      <P x={3} y={11} w={10} h={1} fill="hsl(var(--primary))" />
      {/* Feet */}
      <P x={4} y={12} w={3} h={1} fill="hsl(var(--foreground))" />
      <P x={9} y={12} w={3} h={1} fill="hsl(var(--foreground))" />
    </PixelIcon>
  );
}

export function AgentPatches({ size = 16 }: { size?: number }) {
  // Cat face - calico patches
  return (
    <PixelIcon size={size}>
      {/* Ears */}
      <P x={2} y={1} w={2} h={1} fill="hsl(var(--foreground))" />
      <P x={12} y={1} w={2} h={1} fill="hsl(var(--primary))" />
      <P x={2} y={2} w={3} h={1} fill="hsl(var(--foreground))" />
      <P x={11} y={2} w={3} h={1} fill="hsl(var(--primary))" />
      {/* Head */}
      <P x={3} y={3} w={10} h={1} fill="hsl(var(--card))" />
      <P x={2} y={4} w={12} h={1} fill="hsl(var(--card))" />
      <P x={2} y={4} w={4} h={1} fill="hsl(var(--foreground))" />
      {/* Eyes */}
      <P x={2} y={5} w={12} h={1} fill="hsl(var(--card))" />
      <P x={5} y={5} fill="hsl(var(--terminal-green))" /><P x={10} y={5} fill="hsl(var(--terminal-green))" />
      {/* Nose/mouth */}
      <P x={3} y={6} w={10} h={1} fill="hsl(var(--card))" />
      <P x={7} y={6} w={2} h={1} fill="hsl(var(--primary))" />
      <P x={4} y={7} w={8} h={1} fill="hsl(var(--card))" />
      <P x={6} y={7} fill="hsl(var(--muted-foreground))" /><P x={9} y={7} fill="hsl(var(--muted-foreground))" />
      {/* Body */}
      <P x={5} y={8} w={6} h={1} fill="hsl(var(--card))" />
      <P x={4} y={9} w={8} h={2} fill="hsl(var(--card))" />
      <P x={4} y={9} w={3} h={2} fill="hsl(var(--primary))" />
      <P x={3} y={11} w={10} h={1} fill="hsl(var(--card))" />
      <P x={4} y={12} w={3} h={1} fill="hsl(var(--foreground))" />
      <P x={9} y={12} w={3} h={1} fill="hsl(var(--foreground))" />
    </PixelIcon>
  );
}

export function AgentBandit({ size = 16 }: { size?: number }) {
  // Raccoon - dark mask
  return (
    <PixelIcon size={size}>
      {/* Ears */}
      <P x={3} y={1} w={2} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={11} y={1} w={2} h={1} fill="hsl(var(--muted-foreground))" />
      {/* Head */}
      <P x={4} y={2} w={8} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={3} y={3} w={10} h={1} fill="hsl(var(--muted-foreground))" />
      {/* Mask */}
      <P x={3} y={4} w={10} h={1} fill="hsl(var(--foreground))" />
      <P x={3} y={5} w={10} h={1} fill="hsl(var(--foreground))" />
      <P x={5} y={5} fill="hsl(var(--card))" /><P x={10} y={5} fill="hsl(var(--card))" />
      {/* Snout */}
      <P x={4} y={6} w={8} h={1} fill="hsl(var(--muted-foreground))" />
      <P x={7} y={6} w={2} h={1} fill="hsl(var(--foreground))" />
      <P x={5} y={7} w={6} h={1} fill="hsl(var(--muted-foreground))" />
      {/* Body */}
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

export function AgentWeasel({ size = 16 }: { size?: number }) {
  // Weasel/stoat - long and sleek
  return (
    <PixelIcon size={size}>
      {/* Ears */}
      <P x={4} y={1} w={2} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={10} y={1} w={2} h={1} fill="hsl(var(--terminal-amber))" />
      {/* Head */}
      <P x={4} y={2} w={8} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={3} y={3} w={10} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={3} y={4} w={10} h={1} fill="hsl(var(--terminal-amber))" />
      {/* Eyes */}
      <P x={5} y={4} fill="hsl(var(--foreground))" /><P x={10} y={4} fill="hsl(var(--foreground))" />
      {/* Snout */}
      <P x={4} y={5} w={8} h={1} fill="hsl(var(--terminal-amber))" />
      <P x={6} y={5} w={4} h={1} fill="hsl(var(--card))" />
      <P x={7} y={5} w={2} h={1} fill="hsl(var(--foreground))" />
      {/* Long body */}
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

// Map agent names to icon components
const agentIconMap: Record<string, React.FC<{ size?: number }>> = {
  'Rusty': AgentRusty,
  'Patches': AgentPatches,
  'Bandit': AgentBandit,
  'Weasel': AgentWeasel,
};

export function AgentIcon({ name, size = 16 }: { name: string; size?: number }) {
  const IconComponent = agentIconMap[name];
  if (IconComponent) return <IconComponent size={size} />;
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

// Pixel-art folder icon
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

// Pixel-art gear/settings icon
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

// Pixel-art CPU/chip icon  
export function PixelChip({ size = 16 }: { size?: number }) {
  return (
    <PixelIcon size={size}>
      {/* Pins */}
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
      {/* Body */}
      <P x={3} y={3} w={10} h={10} fill="hsl(var(--secondary))" />
      <rect x={3} y={3} width={10} height={10} fill="none" stroke="hsl(var(--foreground))" strokeWidth={0.5} />
      {/* Die */}
      <P x={5} y={5} w={6} h={6} fill="hsl(var(--primary))" />
    </PixelIcon>
  );
}

// Pixel-art shield icon (Mayor)
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
      {/* Star */}
      <P x={7} y={5} w={2} h={1} fill="hsl(var(--card))" />
      <P x={6} y={6} w={4} h={1} fill="hsl(var(--card))" />
      <P x={7} y={7} w={2} h={1} fill="hsl(var(--card))" />
    </PixelIcon>
  );
}

// Pixel-art chart/stats icon
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
