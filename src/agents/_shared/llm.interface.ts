import type { LanguageModelV1 } from 'ai';

export interface LLMProvider {
  getModel(modelId: string): LanguageModelV1;
  listModels(): ModelMeta[];
  selectModel(options: ModelSelectionOptions): ModelMeta;
}

export interface ModelMeta {
  id: string;
  name: string;
  provider: string;
  tier: 'fast' | 'balanced' | 'powerful';
  contextWindow: number;
  maxOutput: number;
}

export interface ModelSelectionOptions {
  complexity: 'simple' | 'moderate' | 'complex';
  preferredProvider?: string;
  maxCostPer1kInput?: number;
}

export interface StreamOptions {
  model: LanguageModelV1;
  messages: LLMMessage[];
  systemPrompt?: string;
  maxTokens?: number;
  tools?: LLMToolDefinition[];
}

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
}

export interface LLMToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}
