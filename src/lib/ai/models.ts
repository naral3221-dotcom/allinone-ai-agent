export interface ModelInfo {
  id: string;
  provider: 'anthropic' | 'openai' | 'google';
  name: string;
  contextWindow: number;
  maxOutput: number;
  costPer1kInput: number;
  costPer1kOutput: number;
  tier: 'fast' | 'balanced' | 'powerful';
}

export const MODEL_REGISTRY: Record<string, ModelInfo> = {
  'claude-opus': {
    id: 'claude-opus',
    provider: 'anthropic',
    name: 'Claude Opus 4.6',
    contextWindow: 200000,
    maxOutput: 32000,
    costPer1kInput: 0.015,
    costPer1kOutput: 0.075,
    tier: 'powerful',
  },
  'claude-sonnet': {
    id: 'claude-sonnet',
    provider: 'anthropic',
    name: 'Claude Sonnet 4.6',
    contextWindow: 200000,
    maxOutput: 16000,
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
    tier: 'balanced',
  },
  'claude-haiku': {
    id: 'claude-haiku',
    provider: 'anthropic',
    name: 'Claude Haiku 4.5',
    contextWindow: 200000,
    maxOutput: 8192,
    costPer1kInput: 0.001,
    costPer1kOutput: 0.005,
    tier: 'fast',
  },
  'gpt-4o': {
    id: 'gpt-4o',
    provider: 'openai',
    name: 'GPT-4o',
    contextWindow: 128000,
    maxOutput: 16384,
    costPer1kInput: 0.005,
    costPer1kOutput: 0.015,
    tier: 'balanced',
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    provider: 'openai',
    name: 'GPT-4o Mini',
    contextWindow: 128000,
    maxOutput: 16384,
    costPer1kInput: 0.00015,
    costPer1kOutput: 0.0006,
    tier: 'fast',
  },
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    provider: 'google',
    name: 'Gemini 2.0 Flash',
    contextWindow: 1000000,
    maxOutput: 8192,
    costPer1kInput: 0.0001,
    costPer1kOutput: 0.0004,
    tier: 'fast',
  },
  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro',
    provider: 'google',
    name: 'Gemini 2.5 Pro',
    contextWindow: 1000000,
    maxOutput: 8192,
    costPer1kInput: 0.00125,
    costPer1kOutput: 0.005,
    tier: 'balanced',
  },
} as const;

export type ModelId = keyof typeof MODEL_REGISTRY;

export function getModelInfo(modelId: string): ModelInfo | undefined {
  return MODEL_REGISTRY[modelId];
}

export function getModelsByTier(tier: ModelInfo['tier']): ModelInfo[] {
  return Object.values(MODEL_REGISTRY).filter((m) => m.tier === tier);
}

export function getModelsByProvider(provider: ModelInfo['provider']): ModelInfo[] {
  return Object.values(MODEL_REGISTRY).filter((m) => m.provider === provider);
}
