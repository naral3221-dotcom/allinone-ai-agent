'use client';
import { Button } from '@/components/ui/button';
import { KbCard } from './kb-card';

interface KnowledgeBase {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

interface KbListProps {
  knowledgeBases: KnowledgeBase[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export function KbList({ knowledgeBases, onSelect, onDelete, onCreate }: KbListProps) {
  return (
    <div data-testid="kb-list">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Knowledge Bases
        </h2>
        <Button onClick={onCreate} data-testid="create-kb-button">
          Create New
        </Button>
      </div>
      {knowledgeBases.length === 0 ? (
        <p data-testid="kb-empty" className="text-sm text-zinc-400">
          No knowledge bases yet. Create one to get started.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {knowledgeBases.map((kb) => (
            <KbCard key={kb.id} kb={kb} onSelect={onSelect} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
