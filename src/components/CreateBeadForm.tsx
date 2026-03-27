// CreateBeadForm — quick bead creation

import React, { useState } from 'react';
import { useGasTown } from '../context/GasTownContext';
import { Plus } from 'lucide-react';

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
        className="flex items-center gap-1 px-2 py-1 rounded border border-border text-xs font-mono text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
      >
        <Plus className="w-3 h-3" /> New Bead
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task description..."
        className="bg-secondary border border-border rounded text-xs text-foreground px-2 py-1 font-mono focus:outline-none focus:ring-1 focus:ring-ring w-48"
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
      />
      <button
        type="submit"
        className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-mono hover:bg-primary/90 transition-colors"
      >
        Add
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="px-2 py-1 rounded text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
      >
        ✕
      </button>
    </form>
  );
}
