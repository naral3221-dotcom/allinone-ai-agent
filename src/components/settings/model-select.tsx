'use client';

import { MODEL_REGISTRY } from '@/lib/ai/models';

interface ModelSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function ModelSelect({ value, onChange }: ModelSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-testid="model-select"
      className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      {Object.entries(MODEL_REGISTRY).map(([id, info]) => (
        <option key={id} value={id}>
          {info.name}
        </option>
      ))}
    </select>
  );
}
