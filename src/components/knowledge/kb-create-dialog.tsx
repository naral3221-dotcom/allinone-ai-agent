'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface KbCreateDialogProps {
  onSubmit: (name: string, description?: string) => Promise<void>;
  onCancel: () => void;
}

export function KbCreateDialog({ onSubmit, onCancel }: KbCreateDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    await onSubmit(name.trim(), description.trim() || undefined);
    setIsSubmitting(false);
  };

  return (
    <div
      data-testid="kb-create-dialog"
      className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h3 className="mb-3 text-sm font-medium">Create Knowledge Base</h3>
      <input
        data-testid="kb-name-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="mb-2 w-full h-9 rounded-md border border-zinc-200 px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
      />
      <textarea
        data-testid="kb-desc-input"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="mb-3 w-full h-20 rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
      />
      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={!name.trim() || isSubmitting}
          data-testid="kb-create-submit"
        >
          {isSubmitting ? 'Creating...' : 'Create'}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
