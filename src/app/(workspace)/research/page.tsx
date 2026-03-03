'use client';
import { useState, useEffect, useCallback } from 'react';
import { ResearchForm } from '@/components/research/research-form';
import { ResearchResult } from '@/components/research/research-result';
import { ResearchHistory } from '@/components/research/research-history';
import { StepTimeline } from '@/components/research/step-timeline';

interface AgentRun {
  id: string;
  status: string;
  input: string;
  output: string | null;
  steps: Array<{ agentType: string; action: string; output?: string }>;
  error: string | null;
  duration: number | null;
  createdAt: string;
}

export default function ResearchPage() {
  const [history, setHistory] = useState<AgentRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<AgentRun | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/agent/run?agentType=research&limit=20');
      if (res.ok) {
        const data: { runs?: AgentRun[] } = await res.json();
        setHistory(data.runs ?? []);
      }
    } catch {
      /* ignore fetch errors */
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSubmit = async (query: string) => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, agentType: 'research' }),
      });
      if (res.ok) {
        const data: { run: AgentRun } = await res.json();
        const run = data.run;
        setSelectedRun(run);
        setHistory(prev => [run, ...prev]);
      }
    } catch {
      /* ignore fetch errors */
    }
    setIsRunning(false);
  };

  const handleSelectRun = async (id: string) => {
    try {
      const res = await fetch(`/api/agent/run/${id}`);
      if (res.ok) {
        const data: { run: AgentRun } = await res.json();
        setSelectedRun(data.run);
      }
    } catch {
      /* ignore fetch errors */
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full" data-testid="research-loading">
        <span className="text-zinc-400">불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sidebar: history */}
      <div className="w-72 border-r border-zinc-200 p-4 overflow-y-auto dark:border-zinc-800">
        <ResearchHistory
          items={history.map(r => ({
            id: r.id,
            input: r.input,
            status: r.status,
            createdAt: r.createdAt,
          }))}
          onSelect={handleSelectRun}
          selectedId={selectedRun?.id}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-8">
        <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          딥 리서치
        </h1>
        <ResearchForm onSubmit={handleSubmit} isRunning={isRunning} />

        {selectedRun && (
          <div className="mt-8 space-y-6">
            <ResearchResult result={selectedRun} />
            {selectedRun.steps && selectedRun.steps.length > 0 && (
              <StepTimeline steps={selectedRun.steps} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
