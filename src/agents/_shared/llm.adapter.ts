import type { LLMProvider, ModelMeta, ModelSelectionOptions } from './llm.interface';
import { models, getModel } from '@/lib/ai/providers';
import { MODEL_REGISTRY, type ModelId } from '@/lib/ai/models';
import { selectModel as routeModel } from '@/lib/ai/router';
import type { LanguageModel } from 'ai';

export class VercelAIAdapter implements LLMProvider {
  getModel(modelId: string): LanguageModel {
    const model = models[modelId as keyof typeof models];
    if (!model) {
      throw new Error(`Unknown model: ${modelId}`);
    }
    return model;
  }

  listModels(): ModelMeta[] {
    return Object.entries(MODEL_REGISTRY).map(([id, info]) => ({
      id,
      name: info.name,
      provider: info.provider,
      tier: info.tier,
      contextWindow: info.contextWindow,
      maxOutput: info.maxOutput,
    }));
  }

  selectModel(options: ModelSelectionOptions): ModelMeta {
    const modelId = routeModel({
      complexity: options.complexity,
      preferredProvider: options.preferredProvider as 'anthropic' | 'openai' | 'google' | undefined,
      maxCostPer1kInput: options.maxCostPer1kInput,
    });

    const info = MODEL_REGISTRY[modelId as ModelId];
    return {
      id: modelId,
      name: info.name,
      provider: info.provider,
      tier: info.tier,
      contextWindow: info.contextWindow,
      maxOutput: info.maxOutput,
    };
  }
}
