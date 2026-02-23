'use client';

import { useState, useEffect, useCallback } from 'react';

interface Document {
  id: string;
  title: string;
  type: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface UseDocumentsReturn {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  createDocument: (input: {
    title: string;
    content?: unknown;
    type?: string;
  }) => Promise<Document | null>;
  updateDocument: (
    id: string,
    data: { title?: string; content?: unknown }
  ) => Promise<boolean>;
  deleteDocument: (id: string) => Promise<boolean>;
  aiAssist: (
    id: string,
    action: string,
    text: string,
    options?: { language?: string; tone?: string }
  ) => Promise<string | null>;
  refresh: () => void;
}

export function useDocuments(): UseDocumentsReturn {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/documents');
      if (!res.ok) throw new Error('Failed to fetch documents');
      const data = await res.json();
      setDocuments(data.documents ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const createDocument = useCallback(
    async (input: {
      title: string;
      content?: unknown;
      type?: string;
    }): Promise<Document | null> => {
      try {
        const res = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error('Failed to create document');
        const data = await res.json();
        const doc = data.document;
        setDocuments((prev) => [doc, ...prev]);
        return doc;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      }
    },
    []
  );

  const updateDocument = useCallback(
    async (
      id: string,
      data: { title?: string; content?: unknown }
    ): Promise<boolean> => {
      try {
        const res = await fetch(`/api/documents/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update document');
        const responseData = await res.json();
        const updatedDoc = responseData.document;
        setDocuments((prev) =>
          prev.map((d) => (d.id === id ? updatedDoc : d))
        );
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    []
  );

  const deleteDocument = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete document');
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    []
  );

  const aiAssist = useCallback(
    async (
      id: string,
      action: string,
      text: string,
      options?: { language?: string; tone?: string }
    ): Promise<string | null> => {
      try {
        const res = await fetch(`/api/documents/${id}/ai-assist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, text, options }),
        });
        if (!res.ok) throw new Error('Failed to get AI assistance');
        const data = await res.json();
        return data.result ?? null;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      }
    },
    []
  );

  return {
    documents,
    isLoading,
    error,
    createDocument,
    updateDocument,
    deleteDocument,
    aiAssist,
    refresh: fetchDocuments,
  };
}
