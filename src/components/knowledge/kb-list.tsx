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
          지식 베이스
        </h2>
        <Button onClick={onCreate} data-testid="create-kb-button">
          새로 만들기
        </Button>
      </div>
      {knowledgeBases.length === 0 ? (
        <p data-testid="kb-empty" className="text-sm text-zinc-400">
          아직 지식 베이스가 없습니다. 시작하려면 하나를 만드세요.
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
