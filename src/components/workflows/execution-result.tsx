'use client';

import { cn } from '@/lib/utils/cn';

interface StepResult {
  step: number;
  status: string;
  output?: string;
  error?: string;
}

interface ExecutionResultProps {
  result: {
    status: string;
    results: StepResult[];
  };
}

export function ExecutionResult({ result }: ExecutionResultProps) {
  const isOverallCompleted = result.status === 'completed';

  return (
    <div data-testid="execution-result" className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Status:
        </span>
        <span
          data-testid="execution-status"
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            isOverallCompleted
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
          )}
        >
          {result.status}
        </span>
      </div>

      <div className="space-y-2">
        {result.results.map((stepResult) => {
          const isStepCompleted = stepResult.status === 'completed';
          return (
            <div
              key={stepResult.step}
              data-testid={`step-result-${stepResult.step}`}
              className={cn(
                'rounded-md border p-3',
                isStepCompleted
                  ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                  : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Step {stepResult.step}</span>
                <span
                  className={cn(
                    'text-xs font-medium',
                    isStepCompleted
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {stepResult.status}
                </span>
              </div>
              {stepResult.output && (
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {stepResult.output}
                </p>
              )}
              {stepResult.error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {stepResult.error}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
