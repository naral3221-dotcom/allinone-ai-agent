'use client';

import { useState, useEffect, useCallback } from 'react';

interface KnowledgeBase {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

interface SearchResult {
  content: string;
  similarity: number;
  title: string;
}

interface UseKnowledgeReturn {
  knowledgeBases: KnowledgeBase[];
  isLoading: boolean;
  error: string | null;
  createKB: (
    name: string,
    description?: string
  ) => Promise<KnowledgeBase | null>;
  deleteKB: (id: string) => Promise<boolean>;
  addEntry: (
    kbId: string,
    entry: { title: string; content: string; sourceType: string }
  ) => Promise<boolean>;
  search: (kbId: string, query: string) => Promise<SearchResult[]>;
  refresh: () => void;
}

export function useKnowledge(): UseKnowledgeReturn {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKnowledgeBases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/knowledge');
      if (!res.ok) throw new Error('Failed to fetch knowledge bases');
      const data = await res.json();
      setKnowledgeBases(data.knowledgeBases ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKnowledgeBases();
  }, [fetchKnowledgeBases]);

  const createKB = useCallback(
    async (
      name: string,
      description?: string
    ): Promise<KnowledgeBase | null> => {
      try {
        const res = await fetch('/api/knowledge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description }),
        });
        if (!res.ok) throw new Error('Failed to create knowledge base');
        const data = await res.json();
        const kb = data.knowledgeBase;
        setKnowledgeBases((prev) => [kb, ...prev]);
        return kb;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      }
    },
    []
  );

  const deleteKB = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/knowledge/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete knowledge base');
      setKnowledgeBases((prev) => prev.filter((kb) => kb.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, []);

  const addEntry = useCallback(
    async (
      kbId: string,
      entry: { title: string; content: string; sourceType: string }
    ): Promise<boolean> => {
      try {
        const res = await fetch(`/api/knowledge/${kbId}/entries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        });
        if (!res.ok) throw new Error('Failed to add entry');
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    []
  );

  const search = useCallback(
    async (kbId: string, query: string): Promise<SearchResult[]> => {
      try {
        const res = await fetch(`/api/knowledge/${kbId}/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });
        if (!res.ok) throw new Error('Failed to search knowledge base');
        const data = await res.json();
        return data.results ?? [];
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return [];
      }
    },
    []
  );

  return {
    knowledgeBases,
    isLoading,
    error,
    createKB,
    deleteKB,
    addEntry,
    search,
    refresh: fetchKnowledgeBases,
  };
}
