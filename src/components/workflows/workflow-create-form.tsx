'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StepEditor } from './step-editor';

interface WorkflowStep {
  agentType: string;
  prompt: string;
}

interface WorkflowCreateFormProps {
  onSubmit: (input: {
    name: string;
    description?: string;
    steps: Array<{ order: number; agentType: string; prompt: string }>;
  }) => Promise<void>;
  onCancel: () => void;
}

export function WorkflowCreateForm({ onSubmit, onCancel }: WorkflowCreateFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = name.trim().length > 0 && steps.length > 0;

  const addStep = () => {
    setSteps((prev) => [...prev, { agentType: 'orchestrator', prompt: '' }]);
  };

  const removeStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, updated: WorkflowStep) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? updated : s)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        steps: steps.map((s, i) => ({
          order: i + 1,
          agentType: s.agentType,
          prompt: s.prompt,
        })),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      data-testid="wf-create-form"
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div>
        <label
          htmlFor="wf-name"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          이름
        </label>
        <input
          id="wf-name"
          data-testid="wf-name-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="워크플로우 이름"
          required
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </div>

      <div>
        <label
          htmlFor="wf-desc"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          설명
        </label>
        <textarea
          id="wf-desc"
          data-testid="wf-desc-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="선택적 설명"
          rows={2}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            단계
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addStep}
            data-testid="add-step-button"
          >
            단계 추가
          </Button>
        </div>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <StepEditor
              key={index}
              index={index}
              step={step}
              onChange={(updated) => updateStep(index, updated)}
              onRemove={() => removeStep(index)}
            />
          ))}
        </div>
        {steps.length === 0 && (
          <p className="text-sm text-zinc-400">
            워크플로우를 만들려면 최소 하나의 단계를 추가하세요.
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          data-testid="wf-create-submit"
        >
          {isSubmitting ? '만드는 중...' : '워크플로우 만들기'}
        </Button>
      </div>
    </form>
  );
}
