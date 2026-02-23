'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface DocumentEditorProps {
  initialTitle: string;
  initialContent: string;
  onSave: (data: { title: string; content: string }) => Promise<void>;
}

export function DocumentEditor({
  initialTitle,
  initialContent,
  onSave,
}: DocumentEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [isSaving, setIsSaving] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    const content = contentRef.current?.innerHTML ?? '';
    await onSave({ title, content });
    setIsSaving(false);
  }, [title, onSave]);

  return (
    <div data-testid="document-editor" className="space-y-4">
      <div className="flex items-center justify-between">
        <input
          data-testid="doc-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold border-none outline-none bg-transparent text-zinc-900 dark:text-zinc-100 w-full"
          placeholder="Untitled"
        />
        <Button
          onClick={handleSave}
          disabled={isSaving}
          data-testid="doc-save-button"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
      <div
        ref={contentRef}
        contentEditable
        data-testid="doc-content-editor"
        className="min-h-[400px] rounded-md border border-zinc-200 p-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
        dangerouslySetInnerHTML={{ __html: initialContent }}
        suppressContentEditableWarning
      />
    </div>
  );
}
