'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface EntryFormProps {
  onSubmit: (entry: { title: string; content: string; sourceType: string }) => Promise<void>;
}

export function EntryForm({ onSubmit }: EntryFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sourceType, setSourceType] = useState('manual');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setIsSubmitting(true);
    await onSubmit({ title: title.trim(), content: content.trim(), sourceType });
    setTitle('');
    setContent('');
    setIsSubmitting(false);
  };

  return (
    <div data-testid="entry-form" className="space-y-2">
      <input
        data-testid="entry-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Entry title"
        className="h-8 w-full rounded-md border border-zinc-200 px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
      />
      <textarea
        data-testid="entry-content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content..."
        className="h-24 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
      />
      <select
        data-testid="entry-source-type"
        value={sourceType}
        onChange={(e) => setSourceType(e.target.value)}
        className="h-8 rounded-md border border-zinc-200 px-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <option value="manual">Manual</option>
        <option value="web">Web</option>
        <option value="file">File</option>
      </select>
      <Button
        onClick={handleSubmit}
        disabled={!title.trim() || !content.trim() || isSubmitting}
        size="sm"
        data-testid="entry-submit"
      >
        {isSubmitting ? 'Adding...' : 'Add Entry'}
      </Button>
    </div>
  );
}
