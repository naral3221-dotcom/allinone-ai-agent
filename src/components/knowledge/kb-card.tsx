'use client';
import { Button } from '@/components/ui/button';

interface KbCardProps {
  kb: { id: string; name: string; description: string | null; createdAt: string };
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function KbCard({ kb, onSelect, onDelete }: KbCardProps) {
  return (
    <div
      data-testid={`kb-card-${kb.id}`}
      className="cursor-pointer rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
      onClick={() => onSelect(kb.id)}
    >
      <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{kb.name}</h3>
      {kb.description && (
        <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{kb.description}</p>
      )}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-zinc-400">
          {new Date(kb.createdAt).toLocaleDateString()}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(kb.id);
          }}
          data-testid={`delete-kb-${kb.id}`}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
