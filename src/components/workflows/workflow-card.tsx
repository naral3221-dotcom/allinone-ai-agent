'use client';

import { Button } from '@/components/ui/button';

interface WorkflowCardProps {
  workflow: {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
  };
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function WorkflowCard({ workflow, onSelect, onDelete }: WorkflowCardProps) {
  return (
    <div
      data-testid={`wf-card-${workflow.id}`}
      className="cursor-pointer rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
      onClick={() => onSelect(workflow.id)}
    >
      <div className="flex items-start justify-between">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
          {workflow.name}
        </h3>
        <span
          data-testid={`wf-status-${workflow.id}`}
          className={
            workflow.isActive
              ? 'inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
          }
        >
          {workflow.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      {workflow.description && (
        <p className="mt-1 text-sm text-zinc-500 line-clamp-2">
          {workflow.description}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-zinc-400">
          {new Date(workflow.createdAt).toLocaleDateString()}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(workflow.id);
          }}
          data-testid={`delete-wf-${workflow.id}`}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
