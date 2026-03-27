// CreateBeadForm — Planify-style inline creation

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
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Plus className="w-4 h-4" /> New Bead
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task description..."
        className="bg-muted border border-border rounded-lg text-sm text-foreground px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring w-56"
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
      />
      <button
        type="submit"
        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Add
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </form>
  );
}
