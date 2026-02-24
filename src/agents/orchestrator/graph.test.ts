import { describe, it, expect, vi } from 'vitest';

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

import { routeNode, executeNode, shouldContinue } from './nodes';
import type { OrchestratorStateType } from './state';

function makeState(overrides: Partial<OrchestratorStateType> = {}): OrchestratorStateType {
  return {
    messages: [{ role: 'user', content: 'test query' }],
    query: 'test query',
    selectedAgent: 'orchestrator',
    steps: [],
    toolCalls: [],
    output: '',
    isComplete: false,
    error: undefined,
    ...overrides,
  };
}

describe('Orchestrator Nodes', () => {
  describe('routeNode', () => {
    it('should route to research agent', async () => {
      mockGenerateText.mockResolvedValue({ text: 'research' });

      const result = await routeNode(makeState({ query: 'What is quantum computing?' }));
      expect(result.selectedAgent).toBe('research');
      expect(result.steps).toHaveLength(1);
      expect(result.steps![0].action).toBe('route');
    });

    it('should route to code agent', async () => {
      mockGenerateText.mockResolvedValue({ text: 'code' });

      const result = await routeNode(makeState({ query: 'Write a sorting algorithm' }));
      expect(result.selectedAgent).toBe('code');
    });

    it('should fallback to research for invalid agent', async () => {
      mockGenerateText.mockResolvedValue({ text: 'invalid_agent' });

      const result = await routeNode(makeState());
      expect(result.selectedAgent).toBe('research');
    });

    it('should handle trimming and case normalization', async () => {
      mockGenerateText.mockResolvedValue({ text: '  Content  \n' });

      const result = await routeNode(makeState());
      expect(result.selectedAgent).toBe('content');
    });
  });

  describe('executeNode', () => {
    it('should generate response and mark complete', async () => {
      mockGenerateText.mockResolvedValue({
        text: 'Here is the answer...',
        usage: { inputTokens: 100, outputTokens: 200 },
      });

      const result = await executeNode(makeState({ selectedAgent: 'research' }));
      expect(result.output).toBe('Here is the answer...');
      expect(result.isComplete).toBe(true);
      expect(result.steps).toHaveLength(1);
      expect(result.messages).toHaveLength(1);
      expect(result.messages![0].role).toBe('assistant');
    });

    it('should use agent-specific system prompt', async () => {
      mockGenerateText.mockResolvedValue({
        text: 'code output',
        usage: { inputTokens: 50, outputTokens: 100 },
      });

      await executeNode(makeState({ selectedAgent: 'code' }));

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          system: expect.stringContaining('coding assistant'),
        })
      );
    });
  });

  describe('shouldContinue', () => {
    it('should return __end__ when complete', () => {
      expect(shouldContinue(makeState({ isComplete: true }))).toBe('__end__');
    });

    it('should return __end__ on error', () => {
      expect(shouldContinue(makeState({ error: 'Something failed' }))).toBe('__end__');
    });

    it('should return execute when not complete', () => {
      expect(shouldContinue(makeState())).toBe('execute');
    });
  });
});

describe('Orchestrator Graph', () => {
  it('should be importable and create a compiled graph', async () => {
    const { createOrchestratorGraph } = await import('./graph');
    const graph = createOrchestratorGraph();
    expect(graph).toBeDefined();
    expect(graph.invoke).toBeDefined();
  });
});
