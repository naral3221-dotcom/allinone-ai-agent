'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { DocumentEditor } from '@/components/documents/document-editor';
import { AiAssistPanel } from '@/components/documents/ai-assist-panel';

export default function DocumentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [doc, setDoc] = useState<{
    title: string;
    content: unknown;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedText, setSelectedText] = useState('');

  const fetchDoc = useCallback(async () => {
    try {
      const res = await fetch(`/api/documents/${id}`);
      if (res.ok) {
        const data: Record<string, unknown> = await res.json();
        const document = (data.document ?? data) as {
          title: string;
          content: unknown;
        };
        setDoc(document);
      }
    } catch {
      /* fetch error ignored - doc stays null */
    }
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);

  // Listen for text selection
  useEffect(() => {
    const handler = () => {
      const sel = window.getSelection()?.toString() ?? '';
      setSelectedText(sel);
    };
    document.addEventListener('mouseup', handler);
    return () => document.removeEventListener('mouseup', handler);
  }, []);

  const handleSave = async (data: { title: string; content: string }) => {
    await fetch(`/api/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  };

  const handleAiAssist = async (
    action: string,
    text: string,
    options?: { language?: string; tone?: string }
  ) => {
    const res = await fetch(`/api/documents/${id}/ai-assist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, text, ...options }),
    });
    if (!res.ok) return null;
    const data: Record<string, unknown> = await res.json();
    return (data.result as string) ?? null;
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-zinc-400">Loading...</span>
      </div>
    );
  if (!doc)
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-red-500">Document not found</span>
      </div>
    );

  const contentStr =
    typeof doc.content === 'string'
      ? doc.content
      : JSON.stringify(doc.content);

  return (
    <div className="flex h-full">
      <div className="flex-1 p-8">
        <DocumentEditor
          initialTitle={doc.title}
          initialContent={contentStr}
          onSave={handleSave}
        />
      </div>
      <div className="p-4 border-l border-zinc-200 dark:border-zinc-800">
        <AiAssistPanel onAction={handleAiAssist} selectedText={selectedText} />
      </div>
    </div>
  );
}
