// ProjectSidebar — Copland OS aesthetic with progressive collapse
// Desktop (>=1024): full sidebar
// Tablet (768-1023): icon-only rail
// Mobile (<768): hidden, hamburger trigger

import React, { useState, useEffect } from 'react';
import { ModelSelector } from './ModelSelector';
import { PolecatPanel } from './PolecatPanel';
import { MayorPanel } from './MayorPanel';
import { StatsPanel } from './StatsPanel';
import { PixelFolder, PixelGear, PixelChip, PixelShield, PixelChart, WindowCloseBox, WindowZoomBox, AgentIcon } from './CoplandIcons';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

const boards = [
  { id: 'rig_alpha', label: 'Alpha Rig', letter: 'A' },
  { id: 'rig_beta', label: 'Beta Rig', letter: 'B' },
  { id: 'rig_gamma', label: 'Gamma Rig', letter: 'G' },
];

const views = [
  { label: 'Board View', icon: '▣', active: true },
  { label: 'List View', icon: '▤', active: false },
  { label: 'Timeline', icon: '▥', active: false },
];

type SidebarMode = 'full' | 'icon' | 'hidden';

function useResponsiveMode(): SidebarMode {
  const [mode, setMode] = useState<SidebarMode>(() => {
    if (typeof window === 'undefined') return 'full';
    if (window.innerWidth < 768) return 'hidden';
    if (window.innerWidth < 1024) return 'icon';
    return 'full';
  });

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 768) setMode('hidden');
      else if (window.innerWidth < 1024) setMode('icon');
      else setMode('full');
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return mode;
}

export function KDSSidebar() {
  const autoMode = useResponsiveMode();
  const [manualOverride, setManualOverride] = useState<SidebarMode | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const mode = manualOverride ?? autoMode;

  // Reset manual override when crossing breakpoints
  useEffect(() => {
    setManualOverride(null);
    setMobileOpen(false);
  }, [autoMode]);

  // Toggle logic
  const toggleSidebar = () => {
    if (autoMode === 'hidden') {
      setMobileOpen(prev => !prev);
    } else if (mode === 'full') {
      setManualOverride('icon');
    } else {
      setManualOverride('full');
    }
  };

  // Mobile: render hamburger + overlay
  if (autoMode === 'hidden' && !mobileOpen) {
    return (
      <SidebarTriggerButton onClick={toggleSidebar} />
    );
  }

  if (autoMode === 'hidden' && mobileOpen) {
    return (
      <>
        {/* Overlay */}
        <div className="fixed inset-0 bg-foreground/20 z-40" onClick={() => setMobileOpen(false)} />
        {/* Slide-out full sidebar */}
        <aside className="fixed left-0 top-0 bottom-0 w-56 z-50 border-r border-border flex flex-col bg-background copland-raised animate-in slide-in-from-left duration-200">
          <SidebarContent mode="full" onToggle={() => setMobileOpen(false)} showClose />
        </aside>
      </>
    );
  }

  // Tablet/Desktop
  return (
    <aside className={`${mode === 'icon' ? 'w-12' : 'w-56'} border-r border-border flex flex-col bg-background copland-raised transition-all duration-200 flex-shrink-0`}>
      <SidebarContent mode={mode} onToggle={toggleSidebar} />
    </aside>
  );
}

// Floating hamburger for mobile
function SidebarTriggerButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed top-2 left-2 z-50 copland-raised bg-background p-1.5 hover:bg-secondary transition-colors"
      aria-label="Open sidebar"
    >
      <Menu className="w-4 h-4 text-foreground" />
    </button>
  );
}

// Main sidebar content — adapts to mode
function SidebarContent({ mode, onToggle, showClose }: { mode: SidebarMode; onToggle: () => void; showClose?: boolean }) {
  const isIcon = mode === 'icon';

  return (
    <>
      {/* Brand — title bar */}
      <div className="px-2 py-2.5 border-b border-border copland-title-stripes">
        {isIcon ? (
          <div className="flex flex-col items-center gap-1.5">
            <PixelChip size={18} />
            <button onClick={onToggle} className="text-muted-foreground hover:text-foreground" aria-label="Expand sidebar">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {showClose ? (
              <button onClick={onToggle} className="text-muted-foreground hover:text-foreground" aria-label="Close sidebar">
                <X className="w-4 h-4" />
              </button>
            ) : (
              <WindowCloseBox size={12} />
            )}
            <div className="flex items-center gap-1.5 flex-1">
              <PixelChip size={18} />
              <div>
                <h1 className="text-xs font-bold text-foreground leading-none tracking-widest uppercase">Gas Town</h1>
                <span className="text-[10px] text-muted-foreground">actor orchestration</span>
              </div>
            </div>
            <button onClick={onToggle} className="text-muted-foreground hover:text-foreground" aria-label="Collapse sidebar">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Rigs */}
      <div className={`px-2 py-2 border-b border-border ${isIcon ? 'px-1' : ''}`}>
        {!isIcon && <span className="px-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rigs</span>}
        <div className={`${isIcon ? 'space-y-1 mt-0' : 'mt-1.5 copland-inset bg-card p-0.5'}`}>
          {boards.map(b => (
            <button
              key={b.id}
              className={`${isIcon
                ? 'w-full flex items-center justify-center py-2 hover:bg-primary hover:text-primary-foreground transition-colors'
                : 'w-full flex items-center gap-2 px-2 py-1.5 text-xs text-foreground hover:bg-primary hover:text-primary-foreground transition-colors'
              }`}
              title={b.label}
            >
              <PixelFolder size={16} />
              {!isIcon && <span className="flex-1 text-left truncate">{b.label}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Views */}
      <div className={`px-2 py-2 border-b border-border ${isIcon ? 'px-1' : ''}`}>
        {!isIcon && <span className="px-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Views</span>}
        <div className={`${isIcon ? 'space-y-1 mt-0' : 'mt-1.5 space-y-px'}`}>
          {views.map(v => (
            <button
              key={v.label}
              className={`${isIcon
                ? `w-full flex items-center justify-center py-2 transition-colors ${v.active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-primary hover:text-primary-foreground'}`
                : `w-full flex items-center gap-2 px-2 py-1.5 text-xs transition-colors ${v.active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-primary hover:text-primary-foreground'}`
              }`}
              title={v.label}
            >
              <span className={`${isIcon ? 'text-xs' : 'w-3.5 h-3.5 border border-current flex items-center justify-center text-[8px]'}`}>
                {v.icon}
              </span>
              {!isIcon && <span>{v.label}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable panels */}
      <div className={`flex-1 overflow-y-auto py-2 space-y-2 ${isIcon ? 'px-1' : 'px-2'}`}>
        {isIcon ? (
          // Icon-only: show small icons for each section
          <div className="flex flex-col items-center gap-3">
            <div className="copland-raised bg-background p-1.5" title="Engine">
              <PixelChip size={18} />
            </div>
            <div className="copland-raised bg-background p-1.5" title="Agents">
              <AgentIcon name="Rusty" size={18} />
            </div>
            <div className="copland-raised bg-background p-1.5" title="Mayor">
              <PixelShield size={18} />
            </div>
            <div className="copland-raised bg-background p-1.5" title="Stats">
              <PixelChart size={18} />
            </div>
          </div>
        ) : (
          <>
            <div className="copland-inset bg-card p-2">
              <div className="flex items-center gap-1.5 mb-1.5">
                <PixelChip size={14} />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Engine</span>
                <span className="ml-auto"><WebGPUBadge /></span>
              </div>
              <ModelSelector />
            </div>

            <div className="copland-inset bg-card p-2">
              <PolecatPanel />
            </div>

            <div className="copland-inset bg-card p-2">
              <MayorPanel />
            </div>

            <div className="copland-inset bg-card p-2">
              <StatsPanel />
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className={`py-2 border-t border-border copland-title-stripes ${isIcon ? 'px-1 flex justify-center' : 'px-3'}`}>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <PixelGear size={14} />
          {!isIcon && <span>Settings</span>}
        </div>
      </div>
    </>
  );
}
