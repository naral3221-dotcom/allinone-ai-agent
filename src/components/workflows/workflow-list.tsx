'use client';

import { Button } from '@/components/ui/button';
import { WorkflowCard } from './workflow-card';

interface WorkflowItem {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

interface WorkflowListProps {
  workflows: WorkflowItem[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export function WorkflowList({ workflows, onSelect, onDelete, onCreate }: WorkflowListProps) {
  return (
    <div data-testid="workflow-list">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          워크플로우
        </h2>
        <Button onClick={onCreate} data-testid="create-wf-button">
          새로 만들기
        </Button>
      </div>
      {workflows.length === 0 ? (
        <p data-testid="wf-empty" className="text-sm text-zinc-400">
          아직 워크플로우가 없습니다. 시작하려면 하나를 만드세요.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
