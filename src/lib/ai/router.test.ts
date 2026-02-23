import { describe, it, expect, vi } from 'vitest';
import { selectModel } from './router';

vi.mock('./providers', () => ({
  getModel: vi.fn((id: string) => ({ id })),
}));

describe('Model Router', () => {
  it('should route simple tasks to fast tier', () => {
    const modelId = selectModel({ complexity: 'simple' });
    expect(modelId).toBe('claude-haiku');
  });

  it('should route moderate tasks to balanced tier', () => {
    const modelId = selectModel({ complexity: 'moderate' });
    expect(modelId).toBe('claude-sonnet');
  });

  it('should route complex tasks to powerful tier', () => {
    const modelId = selectModel({ complexity: 'complex' });
    expect(modelId).toBe('claude-opus');
  });

  it('should respect preferred provider', () => {
    const modelId = selectModel({
      complexity: 'moderate',
      preferredProvider: 'openai',
    });
    expect(modelId).toBe('gpt-4o');
  });

  it('should respect preferred provider for fast tier', () => {
    const modelId = selectModel({
      complexity: 'simple',
      preferredProvider: 'google',
    });
    expect(modelId).toBe('gemini-2.0-flash');
  });

  it('should filter by max cost', () => {
    const modelId = selectModel({
      complexity: 'moderate',
      preferredProvider: 'anthropic',
      maxCostPer1kInput: 0.002,
    });
    // claude-sonnet costs 0.003 which exceeds limit,
    // so it should fall back to haiku (0.001)
    expect(modelId).toBe('claude-haiku');
  });

  it('should fallback to default when provider has no matching tier', () => {
    const modelId = selectModel({
      complexity: 'complex',
      preferredProvider: 'google',
    });
    // Google has no 'powerful' tier, should fallback to first available
    expect(modelId).toBeDefined();
  });
});
