// CreateBeadForm — Retro bitmap style

import React, { useState } from 'react';
import { useGasTown } from '../context/GasTownContext';
import { Plus, X } from 'lucide-react';

export function CreateBeadForm() {
  const { createBead } = useGasTown();
  const [title, setTitle] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createBead(title.trim(), title.trim());
    setTitle('');
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 px-2.5 py-1.5 border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> new bead
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="task description..."
        className="bg-background border border-border text-xs text-foreground px-2.5 py-1 focus:outline-none focus:border-primary w-48"
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
      />
      <button
        type="submit"
        className="px-2.5 py-1 border border-primary bg-primary text-primary-foreground text-[11px] font-bold hover:bg-primary/90 transition-colors"
      >
        add
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </form>
  );
}
