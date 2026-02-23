import type { ModelId } from './models';
import { MODEL_REGISTRY } from './models';
import { getModel } from './providers';

export type TaskComplexity = 'simple' | 'moderate' | 'complex';

interface RouteOptions {
  complexity: TaskComplexity;
  preferredProvider?: 'anthropic' | 'openai' | 'google';
  maxCostPer1kInput?: number;
}

const COMPLEXITY_TO_TIER: Record<TaskComplexity, 'fast' | 'balanced' | 'powerful'> = {
  simple: 'fast',
  moderate: 'balanced',
  complex: 'powerful',
};

const DEFAULT_MODELS: Record<TaskComplexity, ModelId> = {
  simple: 'claude-haiku',
  moderate: 'claude-sonnet',
  complex: 'claude-opus',
};

export function selectModel(options: RouteOptions): ModelId {
  const targetTier = COMPLEXITY_TO_TIER[options.complexity];

  if (options.preferredProvider) {
    const candidates = Object.entries(MODEL_REGISTRY)
      .filter(([, info]) => info.provider === options.preferredProvider)
      .filter(([, info]) => {
        if (options.maxCostPer1kInput) {
          return info.costPer1kInput <= options.maxCostPer1kInput;
        }
        return true;
      });

    const exactMatch = candidates.find(([, info]) => info.tier === targetTier);
    if (exactMatch) return exactMatch[0] as ModelId;

    if (candidates.length > 0) return candidates[0][0] as ModelId;
  }

  return DEFAULT_MODELS[options.complexity];
}

export function getRoutedModel(options: RouteOptions) {
  const modelId = selectModel(options);
  return { modelId, model: getModel(modelId as Parameters<typeof getModel>[0]) };
}
