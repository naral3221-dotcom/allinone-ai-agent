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

import { classifyContent, generateContent } from './nodes';
import type { ContentStateType } from './state';

function makeState(overrides: Partial<ContentStateType> = {}): ContentStateType {
  return {
    messages: [{ role: 'user', content: 'Write a project proposal' }],
    query: 'Write a project proposal for the new marketing campaign',
    contentType: 'document',
    tone: 'professional',
    contentOutput: '',
    isComplete: false,
    ...overrides,
  };
}

describe('Content Agent Nodes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('classifyContent', () => {
    it('should classify as document', async () => {
      mockGenerateText.mockResolvedValue({ text: 'document' });
      const result = await classifyContent(makeState());
      expect(result.contentType).toBe('document');
    });

    it('should classify as email', async () => {
      mockGenerateText.mockResolvedValue({ text: 'email' });
      const result = await classifyContent(
        makeState({ query: 'Write a follow-up email to the client' })
      );
      expect(result.contentType).toBe('email');
    });

    it('should classify as report', async () => {
      mockGenerateText.mockResolvedValue({ text: 'report' });
      const result = await classifyContent(
        makeState({ query: 'Create a quarterly sales report' })
      );
      expect(result.contentType).toBe('report');
    });

    it('should classify as summary', async () => {
      mockGenerateText.mockResolvedValue({ text: 'summary' });
      const result = await classifyContent(
        makeState({ query: 'Summarize the meeting notes' })
      );
      expect(result.contentType).toBe('summary');
    });

    it('should classify as blog', async () => {
      mockGenerateText.mockResolvedValue({ text: 'blog' });
      const result = await classifyContent(
        makeState({ query: 'Write a blog post about AI trends' })
      );
      expect(result.contentType).toBe('blog');
    });

    it('should fallback to document for invalid content type', async () => {
      mockGenerateText.mockResolvedValue({ text: 'invalid' });
      const result = await classifyContent(makeState());
      expect(result.contentType).toBe('document');
    });
  });

  describe('generateContent', () => {
    it('should generate content and mark complete', async () => {
      mockGenerateText.mockResolvedValue({
        text: '# Project Proposal\n\n## Executive Summary\nThis proposal outlines...',
      });

      const result = await generateContent(makeState());
      expect(result.contentOutput).toContain('Project Proposal');
      expect(result.isComplete).toBe(true);
      expect(result.messages).toHaveLength(1);
    });

    it('should use type-specific system prompt for email', async () => {
      mockGenerateText.mockResolvedValue({ text: 'Dear Client,...' });
      await generateContent(makeState({ contentType: 'email' }));

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          system: expect.stringContaining('email'),
        })
      );
    });
  });
});

describe('Content Graph', () => {
  it('should compile without errors', async () => {
    const { createContentGraph } = await import('./graph');
    const graph = createContentGraph();
    expect(graph).toBeDefined();
    expect(graph.invoke).toBeDefined();
  });
});
