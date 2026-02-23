'use client';

interface HistoryItem {
  id: string;
  input: string;
  status: string;
  createdAt: string;
}

interface ResearchHistoryProps {
  items: HistoryItem[];
  onSelect: (id: string) => void;
  selectedId?: string;
}

export function ResearchHistory({ items, onSelect, selectedId }: ResearchHistoryProps) {
  if (items.length === 0) {
    return (
      <p data-testid="history-empty" className="text-sm text-zinc-400">
        No research history yet.
      </p>
    );
  }

  return (
    <div data-testid="research-history" className="space-y-1">
      <h3 className="mb-2 text-xs font-medium text-zinc-400 uppercase">History</h3>
      {items.map(item => (
        <button
          key={item.id}
          data-testid={`history-item-${item.id}`}
          onClick={() => onSelect(item.id)}
          className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
            selectedId === item.id
              ? 'bg-zinc-200 dark:bg-zinc-800'
              : 'hover:bg-zinc-100 dark:hover:bg-zinc-900'
          }`}
        >
          <p className="truncate text-zinc-900 dark:text-zinc-100">{item.input}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <span
              className={`text-xs ${
                item.status === 'completed'
                  ? 'text-green-600'
                  : item.status === 'failed'
                    ? 'text-red-600'
                    : 'text-yellow-600'
              }`}
            >
              {item.status}
            </span>
            <span className="text-xs text-zinc-400">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
