import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGenerateText } = vi.hoisted(() => ({
  mockGenerateText: vi.fn(),
}));

vi.mock('ai', () => ({
  generateText: mockGenerateText,
}));

vi.mock('@/lib/ai/providers', () => ({
  models: {
    'claude-haiku': { modelId: 'claude-haiku' },
    'claude-sonnet': { modelId: 'claude-sonnet' },
  },
}));

import { classifyAction, executeCode } from './nodes';
import type { CodeStateType } from './state';

function makeState(overrides: Partial<CodeStateType> = {}): CodeStateType {
  return {
    messages: [{ role: 'user', content: 'Write a sort function' }],
    query: 'Write a sort function in Python',
    action: 'generate',
    language: '',
    codeOutput: '',
    explanation: '',
    toolCalls: [],
    isComplete: false,
    ...overrides,
  };
}

describe('Code Agent Nodes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('classifyAction', () => {
    it('should classify as generate', async () => {
      mockGenerateText.mockResolvedValue({ text: 'generate' });
      const result = await classifyAction(makeState());
      expect(result.action).toBe('generate');
    });

    it('should classify as review', async () => {
      mockGenerateText.mockResolvedValue({ text: 'review' });
      const result = await classifyAction(makeState({ query: 'Review this code...' }));
      expect(result.action).toBe('review');
    });

    it('should classify as debug', async () => {
      mockGenerateText.mockResolvedValue({ text: 'debug' });
      const result = await classifyAction(makeState({ query: 'Fix this error...' }));
      expect(result.action).toBe('debug');
    });

    it('should fallback to generate for invalid action', async () => {
      mockGenerateText.mockResolvedValue({ text: 'invalid' });
      const result = await classifyAction(makeState());
      expect(result.action).toBe('generate');
    });
  });

  describe('executeCode', () => {
    it('should generate code and mark complete', async () => {
      mockGenerateText.mockResolvedValue({
        text: '```python\ndef sort(arr):\n    return sorted(arr)\n```',
      });

      const result = await executeCode(makeState());
      expect(result.codeOutput).toContain('def sort');
      expect(result.isComplete).toBe(true);
      expect(result.messages).toHaveLength(1);
    });

    it('should use action-specific system prompt', async () => {
      mockGenerateText.mockResolvedValue({ text: 'review feedback' });
      await executeCode(makeState({ action: 'review' }));

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          system: expect.stringContaining('code reviewer'),
        })
      );
    });
  });
});

describe('Code Graph', () => {
  it('should compile without errors', async () => {
    const { createCodeGraph } = await import('./graph');
    const graph = createCodeGraph();
    expect(graph).toBeDefined();
    expect(graph.invoke).toBeDefined();
  });
});
