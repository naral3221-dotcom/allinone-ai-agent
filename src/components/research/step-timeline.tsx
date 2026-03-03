'use client';

interface Step {
  agentType: string;
  action: string;
  output?: string;
  timestamp?: string;
}

interface StepTimelineProps {
  steps: Step[];
}

export function StepTimeline({ steps }: StepTimelineProps) {
  if (steps.length === 0) return null;

  return (
    <div data-testid="step-timeline" className="space-y-3">
      <h3 className="text-xs font-medium text-zinc-400 uppercase">실행 단계</h3>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div
            key={i}
            data-testid={`step-${i}`}
            className="flex gap-3 rounded-md border border-zinc-200 p-3 dark:border-zinc-800"
          >
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium dark:bg-zinc-800">
              {i + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-zinc-500">{step.agentType}</span>
                <span className="text-xs text-zinc-900 dark:text-zinc-100 font-medium">
                  {step.action}
                </span>
              </div>
              {step.output && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3">
                  {step.output}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
