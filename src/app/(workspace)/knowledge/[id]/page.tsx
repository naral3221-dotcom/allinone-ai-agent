'use client';
import { useState, useEffect, useCallback, use } from 'react';
import { Button } from '@/components/ui/button';
import { EntryList } from '@/components/knowledge/entry-list';
import { EntryForm } from '@/components/knowledge/entry-form';
import { SearchPanel } from '@/components/knowledge/search-panel';

export default function KnowledgeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [kb, setKb] = useState<{
    id: string;
    name: string;
    description: string | null;
  } | null>(null);
  const [entries, setEntries] = useState<
    Array<{ title: string; content: string; sourceType: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'entries' | 'search'>('entries');

  const fetchKb = useCallback(async () => {
    try {
      const res = await fetch(`/api/knowledge/${id}`);
      if (res.ok) {
        const data: Record<string, unknown> = await res.json();
        setKb(
          (data.knowledgeBase as {
            id: string;
            name: string;
            description: string | null;
          }) ?? (data as { id: string; name: string; description: string | null })
        );
        setEntries(
          (data.entries as Array<{
            title: string;
            content: string;
            sourceType: string;
          }>) ?? []
        );
      }
    } catch {
      /* ignore */
    }
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    fetchKb();
  }, [fetchKb]);

  const handleAddEntry = async (entry: {
    title: string;
    content: string;
    sourceType: string;
  }) => {
    const res = await fetch(`/api/knowledge/${id}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (res.ok) fetchKb();
  };

  const handleSearch = async (query: string) => {
    const res = await fetch(`/api/knowledge/${id}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) return [];
    const data: Record<string, unknown> = await res.json();
    return (
      (data.results as Array<{
        content: string;
        similarity: number;
        title: string;
      }>) ?? []
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-zinc-400">Loading...</span>
      </div>
    );
  }

  if (!kb) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-red-500">Knowledge base not found</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            window.location.href = '/knowledge';
          }}
          data-testid="back-button"
        >
          Back
        </Button>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {kb.name}
        </h1>
        {kb.description && (
          <p className="mt-1 text-sm text-zinc-500">{kb.description}</p>
        )}
      </div>

      <div className="mb-4 flex gap-2">
        <Button
          variant={activeTab === 'entries' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('entries')}
          data-testid="tab-entries"
        >
          Entries
        </Button>
        <Button
          variant={activeTab === 'search' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('search')}
          data-testid="tab-search"
        >
          Search
        </Button>
      </div>

      {activeTab === 'entries' ? (
        <div className="space-y-6">
          <EntryForm onSubmit={handleAddEntry} />
          <EntryList entries={entries} />
        </div>
      ) : (
        <SearchPanel onSearch={handleSearch} />
      )}
    </div>
  );
}
