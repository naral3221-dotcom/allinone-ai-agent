'use client';

import { useState, useEffect, useCallback } from 'react';

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

interface WorkflowResult {
  status: string;
  results: unknown[];
}

interface UseWorkflowReturn {
  workflows: Workflow[];
  isLoading: boolean;
  error: string | null;
  createWorkflow: (input: {
    name: string;
    description?: string;
    steps: unknown[];
  }) => Promise<Workflow | null>;
  deleteWorkflow: (id: string) => Promise<boolean>;
  executeWorkflow: (id: string) => Promise<WorkflowResult | null>;
  refresh: () => void;
}

export function useWorkflow(): UseWorkflowReturn {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflows = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/workflows');
      if (!res.ok) throw new Error('Failed to fetch workflows');
      const data = await res.json();
      setWorkflows(data.workflows ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const createWorkflow = useCallback(
    async (input: {
      name: string;
      description?: string;
      steps: unknown[];
    }): Promise<Workflow | null> => {
      try {
        const res = await fetch('/api/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error('Failed to create workflow');
        const data = await res.json();
        const workflow = data.workflow;
        setWorkflows((prev) => [workflow, ...prev]);
        return workflow;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      }
    },
    []
  );

  const deleteWorkflow = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/workflows/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete workflow');
        setWorkflows((prev) => prev.filter((w) => w.id !== id));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    []
  );

  const executeWorkflow = useCallback(
    async (id: string): Promise<WorkflowResult | null> => {
      try {
        const res = await fetch(`/api/workflows/${id}/execute`, {
          method: 'POST',
        });
        if (!res.ok) throw new Error('Failed to execute workflow');
        const data = await res.json();
        return data.result ?? null;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      }
    },
    []
  );

  return {
    workflows,
    isLoading,
    error,
    createWorkflow,
    deleteWorkflow,
    executeWorkflow,
    refresh: fetchWorkflows,
  };
}
