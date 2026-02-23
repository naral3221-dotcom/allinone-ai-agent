import { describe, it, expect, vi } from 'vitest';
import { VercelAIAdapter } from './llm.adapter';

vi.mock('@/lib/ai/providers', () => ({
  models: {
    'claude-sonnet': { modelId: 'claude-sonnet' },
    'gpt-4o': { modelId: 'gpt-4o' },
  },
  getModel: vi.fn((id: string) => ({ modelId: id })),
}));

vi.mock('@/lib/ai/router', () => ({
  selectModel: vi.fn(() => 'claude-sonnet'),
}));

describe('VercelAIAdapter', () => {
  const adapter = new VercelAIAdapter();

  describe('getModel', () => {
    it('should return a model by id', () => {
      const model = adapter.getModel('claude-sonnet');
      expect(model).toBeDefined();
    });

    it('should throw for unknown model', () => {
      expect(() => adapter.getModel('nonexistent')).toThrow('Unknown model');
    });
  });

  describe('listModels', () => {
    it('should return all models with metadata', () => {
      const models = adapter.listModels();
      expect(models.length).toBeGreaterThan(0);
      expect(models[0]).toHaveProperty('id');
      expect(models[0]).toHaveProperty('name');
      expect(models[0]).toHaveProperty('provider');
      expect(models[0]).toHaveProperty('tier');
    });
  });

  describe('selectModel', () => {
    it('should select model based on complexity', () => {
      const meta = adapter.selectModel({ complexity: 'moderate' });
      expect(meta).toBeDefined();
      expect(meta.id).toBe('claude-sonnet');
    });
  });
});
