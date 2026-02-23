'use client';

const AGENT_TYPES = [
  'orchestrator',
  'research',
  'code',
  'content',
  'data',
  'marketing',
] as const;

interface StepEditorProps {
  index: number;
  step: { agentType: string; prompt: string };
  onChange: (step: { agentType: string; prompt: string }) => void;
  onRemove: () => void;
}

export function StepEditor({ index, step, onChange, onRemove }: StepEditorProps) {
  return (
    <div
      data-testid={`step-editor-${index}`}
      className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
        {index + 1}
      </span>
      <div className="flex flex-1 flex-col gap-2">
        <select
          data-testid={`step-agent-${index}`}
          value={step.agentType}
          onChange={(e) => onChange({ ...step, agentType: e.target.value })}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        >
          {AGENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <textarea
          data-testid={`step-prompt-${index}`}
          value={step.prompt}
          onChange={(e) => onChange({ ...step, prompt: e.target.value })}
          placeholder="Enter prompt for this step..."
          rows={2}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </div>
      <button
        data-testid={`remove-step-${index}`}
        onClick={onRemove}
        type="button"
        className="shrink-0 rounded-md px-2 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
      >
        Remove
      </button>
    </div>
  );
}
