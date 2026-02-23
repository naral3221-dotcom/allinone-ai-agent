'use client';

interface Entry {
  title: string;
  content: string;
  sourceType: string;
}

interface EntryListProps {
  entries: Entry[];
}

export function EntryList({ entries }: EntryListProps) {
  if (entries.length === 0) {
    return (
      <p data-testid="entry-empty" className="text-sm text-zinc-400">
        No entries yet.
      </p>
    );
  }
  return (
    <div data-testid="entry-list" className="space-y-2">
      {entries.map((entry, i) => (
        <div
          key={i}
          className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800"
          data-testid={`entry-${i}`}
        >
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium">{entry.title}</span>
            <span className="text-xs text-zinc-400">{entry.sourceType}</span>
          </div>
          <p className="text-xs text-zinc-600 line-clamp-2 dark:text-zinc-400">
            {entry.content}
          </p>
        </div>
      ))}
    </div>
  );
}
