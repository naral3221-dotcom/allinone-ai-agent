'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ResearchFormProps {
  onSubmit: (query: string) => Promise<void>;
  isRunning: boolean;
}

export function ResearchForm({ onSubmit, isRunning }: ResearchFormProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = async () => {
    if (!query.trim() || isRunning) return;
    await onSubmit(query.trim());
    setQuery('');
  };

  return (
    <div data-testid="research-form" className="space-y-3">
      <textarea
        data-testid="research-query"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="무엇을 조사하고 싶으신가요? 자세한 질문이나 주제를 입력하세요..."
        className="w-full h-24 rounded-md border border-zinc-200 p-3 text-sm resize-none dark:border-zinc-800 dark:bg-zinc-950"
        onKeyDown={e => {
          if (e.key === 'Enter' && e.ctrlKey) handleSubmit();
        }}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">Ctrl+Enter로 제출</span>
        <Button
          onClick={handleSubmit}
          disabled={!query.trim() || isRunning}
          data-testid="research-submit"
        >
          {isRunning ? '조사 중...' : '조사 시작'}
        </Button>
      </div>
    </div>
  );
}
