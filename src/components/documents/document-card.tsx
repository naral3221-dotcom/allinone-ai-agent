'use client';

import { Button } from '@/components/ui/button';

interface DocumentCardProps {
  document: {
    id: string;
    title: string;
    type: string;
    tags: string[];
    updatedAt: string;
  };
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DocumentCard({ document, onSelect, onDelete }: DocumentCardProps) {
  return (
    <div
      data-testid={`doc-card-${document.id}`}
      className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 cursor-pointer hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      onClick={() => onSelect(document.id)}
    >
      <div>
        <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
          {document.title}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs rounded bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
            {document.type}
          </span>
          {document.tags.map((tag) => (
            <span key={tag} className="text-xs text-zinc-400">
              #{tag}
            </span>
          ))}
          <span className="text-xs text-zinc-400">
            {new Date(document.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(document.id);
        }}
        data-testid={`delete-doc-${document.id}`}
      >
        Delete
      </Button>
    </div>
  );
}
