'use client';

import { MODEL_REGISTRY, type ModelId } from '@/lib/ai/models';

interface ModelSelectorProps {
  selectedModel: ModelId;
  onModelChange: (modelId: ModelId) => void;
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  return (
    <select
      value={selectedModel}
      onChange={(e) => onModelChange(e.target.value as ModelId)}
      className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
    >
      {Object.entries(MODEL_REGISTRY).map(([id, info]) => (
        <option key={id} value={id}>
          {info.name}
        </option>
      ))}
    </select>
  );
}
