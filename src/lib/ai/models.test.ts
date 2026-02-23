import { describe, it, expect } from 'vitest';
import {
  MODEL_REGISTRY,
  getModelInfo,
  getModelsByTier,
  getModelsByProvider,
} from './models';

describe('Model Registry', () => {
  it('should have all expected models', () => {
    const modelIds = Object.keys(MODEL_REGISTRY);
    expect(modelIds).toContain('claude-opus');
    expect(modelIds).toContain('claude-sonnet');
    expect(modelIds).toContain('claude-haiku');
    expect(modelIds).toContain('gpt-4o');
    expect(modelIds).toContain('gpt-4o-mini');
    expect(modelIds).toContain('gemini-2.0-flash');
    expect(modelIds).toContain('gemini-2.5-pro');
  });

  it('should return model info by id', () => {
    const info = getModelInfo('claude-sonnet');
    expect(info).toBeDefined();
    expect(info?.provider).toBe('anthropic');
    expect(info?.tier).toBe('balanced');
    expect(info?.contextWindow).toBeGreaterThan(0);
  });

  it('should return undefined for unknown model', () => {
    expect(getModelInfo('unknown-model')).toBeUndefined();
  });

  it('should filter by tier', () => {
    const fast = getModelsByTier('fast');
    expect(fast.length).toBeGreaterThan(0);
    expect(fast.every((m) => m.tier === 'fast')).toBe(true);
  });

  it('should filter by provider', () => {
    const anthropic = getModelsByProvider('anthropic');
    expect(anthropic.length).toBe(3);
    expect(anthropic.every((m) => m.provider === 'anthropic')).toBe(true);
  });

  it('should have valid cost data', () => {
    Object.values(MODEL_REGISTRY).forEach((model) => {
      expect(model.costPer1kInput).toBeGreaterThan(0);
      expect(model.costPer1kOutput).toBeGreaterThan(0);
      expect(model.costPer1kOutput).toBeGreaterThanOrEqual(model.costPer1kInput);
    });
  });
});
