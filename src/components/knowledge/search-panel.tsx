'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SearchResult {
  content: string;
  similarity: number;
  title: string;
}

interface SearchPanelProps {
  onSearch: (query: string) => Promise<SearchResult[]>;
}

export function SearchPanel({ onSearch }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    const res = await onSearch(query.trim());
    setResults(res);
    setIsSearching(false);
  };

  return (
    <div data-testid="search-panel" className="space-y-3">
      <div className="flex gap-2">
        <input
          data-testid="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search knowledge base..."
          className="h-9 flex-1 rounded-md border border-zinc-200 px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button
          onClick={handleSearch}
          disabled={!query.trim() || isSearching}
          data-testid="search-button"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </div>
      {results.length > 0 && (
        <div data-testid="search-results" className="space-y-2">
          {results.map((r, i) => (
            <div
              key={i}
              className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800"
              data-testid={`search-result-${i}`}
            >
              <div className="mb-1 flex justify-between">
                <span className="text-sm font-medium">{r.title}</span>
                <span className="text-xs text-zinc-400">
                  {(r.similarity * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">{r.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
