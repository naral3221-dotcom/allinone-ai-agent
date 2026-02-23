'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface CreateDialogProps {
  onSubmit: (input: { title: string; type: string }) => Promise<void>;
  onCancel: () => void;
}

export function CreateDialog({ onSubmit, onCancel }: CreateDialogProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('document');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    await onSubmit({ title: title.trim(), type });
    setIsSubmitting(false);
  };

  return (
    <div
      data-testid="create-doc-dialog"
      className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h3 className="mb-3 text-sm font-medium">Create Document</h3>
      <input
        data-testid="doc-title-create"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Document title"
        className="mb-2 w-full h-9 rounded-md border border-zinc-200 px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
      />
      <select
        data-testid="doc-type-select"
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="mb-3 h-9 rounded-md border border-zinc-200 px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <option value="document">Document</option>
        <option value="note">Note</option>
        <option value="report">Report</option>
      </select>
      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={!title.trim() || isSubmitting}
          data-testid="doc-create-submit"
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
