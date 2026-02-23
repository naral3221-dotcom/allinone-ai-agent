'use client';

import { useState } from 'react';
import { useWorkflow } from '@/hooks/useWorkflow';
import { WorkflowList } from '@/components/workflows/workflow-list';
import { WorkflowCreateForm } from '@/components/workflows/workflow-create-form';

export default function WorkflowsPage() {
  const { workflows, isLoading, error, createWorkflow, deleteWorkflow } = useWorkflow();
  const [showCreate, setShowCreate] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center" data-testid="wf-loading">
        <span className="text-zinc-400">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center" data-testid="wf-error">
        <span className="text-red-500">Error: {error}</span>
      </div>
    );
  }

  const handleSelect = (id: string) => {
    window.location.href = `/workflows/${id}`;
  };

  const handleCreate = async (input: {
    name: string;
    description?: string;
    steps: Array<{ order: number; agentType: string; prompt: string }>;
  }) => {
    const wf = await createWorkflow(input);
    if (wf) {
      setShowCreate(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Workflows
      </h1>
      {showCreate && (
        <div className="mb-6">
          <WorkflowCreateForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}
      <WorkflowList
        workflows={workflows}
        onSelect={handleSelect}
        onDelete={deleteWorkflow}
        onCreate={() => setShowCreate(true)}
      />
    </div>
  );
}
