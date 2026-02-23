'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { Button } from '@/components/ui/button';
import { ExecutionResult } from '@/components/workflows/execution-result';

interface WorkflowDetail {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  steps: Array<{
    order: number;
    agentType: string;
    prompt: string;
    config?: Record<string, unknown>;
  }>;
}

interface WorkflowExecutionResult {
  status: string;
  results: Array<{
    step: number;
    status: string;
    output?: string;
    error?: string;
  }>;
}

export default function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [workflow, setWorkflow] = useState<WorkflowDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<WorkflowExecutionResult | null>(
    null
  );

  const fetchWorkflow = useCallback(async () => {
    try {
      const res = await fetch(`/api/workflows/${id}`);
      if (res.ok) {
        const data: Record<string, unknown> = await res.json();
        setWorkflow(
          (data.workflow as WorkflowDetail) ??
            (data as unknown as WorkflowDetail)
        );
      }
    } catch {
      /* ignore */
    }
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    fetchWorkflow();
  }, [fetchWorkflow]);

  const handleExecute = async () => {
    setIsExecuting(true);
    setExecutionResult(null);
    try {
      const res = await fetch(`/api/workflows/${id}/execute`, {
        method: 'POST',
      });
      if (res.ok) {
        const data: Record<string, unknown> = await res.json();
        setExecutionResult(
          (data.result as WorkflowExecutionResult) ?? null
        );
      }
    } catch {
      /* ignore */
    }
    setIsExecuting(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center" data-testid="wf-detail-loading">
        <span className="text-zinc-400">Loading...</span>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex h-full items-center justify-center" data-testid="wf-not-found">
        <span className="text-red-500">Workflow not found</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-8" data-testid="wf-detail">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            window.location.href = '/workflows';
          }}
          data-testid="back-button"
        >
          Back
        </Button>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {workflow.name}
        </h1>
        {workflow.description && (
          <p className="mt-1 text-sm text-zinc-500">{workflow.description}</p>
        )}
      </div>

      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Steps
        </h2>
        <div className="space-y-2">
          {workflow.steps.map((step) => (
            <div
              key={step.order}
              className="flex items-start gap-3 rounded-md border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                {step.order}
              </span>
              <div>
                <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {step.agentType}
                </span>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {step.prompt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <Button
          onClick={handleExecute}
          disabled={isExecuting}
          data-testid="execute-button"
        >
          {isExecuting ? 'Executing...' : 'Execute Workflow'}
        </Button>
      </div>

      {executionResult && <ExecutionResult result={executionResult} />}
    </div>
  );
}
