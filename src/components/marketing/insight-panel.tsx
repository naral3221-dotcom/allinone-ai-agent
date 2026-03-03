'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Insight {
  summary: string;
  recommendations: string[];
  generatedAt: string;
}

interface InsightPanelProps {
  onGenerate: () => Promise<Insight | null>;
}

export function InsightPanel({ onGenerate }: InsightPanelProps) {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const result = await onGenerate();
      if (result) {
        setInsight(result);
      }
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div
      data-testid="insight-panel"
      className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">AI 인사이트</h3>
        <Button
          data-testid="generate-insight-button"
          onClick={handleGenerate}
          disabled={isGenerating}
          size="sm"
        >
          {isGenerating ? '생성 중...' : 'AI 인사이트 생성'}
        </Button>
      </div>

      {insight && (
        <div data-testid="insight-result">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">{insight.summary}</p>

          {insight.recommendations.length > 0 && (
            <ul data-testid="insight-recommendations" className="mt-4 space-y-2">
              {insight.recommendations.map((rec, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                >
                  <span className="mt-0.5 text-zinc-400">&#8226;</span>
                  {rec}
                </li>
              ))}
            </ul>
          )}

          <p className="mt-4 text-xs text-zinc-400">
            생성일: {new Date(insight.generatedAt).toLocaleString('ko-KR')}
          </p>
        </div>
      )}
    </div>
  );
}
