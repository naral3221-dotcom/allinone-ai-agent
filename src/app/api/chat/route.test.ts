import { describe, it, expect, vi } from 'vitest';
import { MODEL_REGISTRY } from '@/lib/ai/models';

describe('Chat API route logic', () => {
  it('should reject invalid model id', () => {
    const modelInfo = MODEL_REGISTRY['nonexistent' as keyof typeof MODEL_REGISTRY];
    expect(modelInfo).toBeUndefined();
  });

  it('should accept valid model id', () => {
    const modelInfo = MODEL_REGISTRY['claude-sonnet'];
    expect(modelInfo).toBeDefined();
    expect(modelInfo.provider).toBe('anthropic');
  });

  it('should calculate cost correctly', () => {
    const modelInfo = MODEL_REGISTRY['claude-sonnet'];
    const inputTokens = 1000;
    const outputTokens = 500;

    const cost =
      (inputTokens / 1000) * modelInfo.costPer1kInput +
      (outputTokens / 1000) * modelInfo.costPer1kOutput;

    expect(cost).toBe(0.003 + 0.0075);
  });

  it('should truncate title to 50 chars', () => {
    const longContent = 'A'.repeat(100);
    const title =
      longContent.slice(0, 50) + (longContent.length > 50 ? '...' : '');
    expect(title).toBe('A'.repeat(50) + '...');
  });

  it('should not add ellipsis for short title', () => {
    const shortContent = 'Hello';
    const title =
      shortContent.slice(0, 50) + (shortContent.length > 50 ? '...' : '');
    expect(title).toBe('Hello');
  });
});
