import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockEmbeddingService } = vi.hoisted(() => ({
  mockEmbeddingService: {
    embedText: vi.fn(),
  },
}));

const { mockVectorStore } = vi.hoisted(() => ({
  mockVectorStore: {
    similaritySearch: vi.fn(),
  },
}));

vi.mock('./embedding', () => {
  const MockEmbeddingService = function (this: Record<string, unknown>) {
    Object.assign(this, mockEmbeddingService);
  } as unknown as typeof import('./embedding').EmbeddingService;
  return { EmbeddingService: MockEmbeddingService };
});

vi.mock('./vector-store', () => {
  const MockVectorStore = function (this: Record<string, unknown>) {
    Object.assign(this, mockVectorStore);
  } as unknown as typeof import('./vector-store').VectorStore;
  return { VectorStore: MockVectorStore };
});

const { mockGenerateText } = vi.hoisted(() => ({
  mockGenerateText: vi.fn(),
}));

vi.mock('ai', () => ({
  generateText: mockGenerateText,
}));

vi.mock('@/lib/ai/providers', () => ({
  models: {
    'claude-sonnet': { modelId: 'claude-sonnet' },
  },
}));

import { RAGPipeline } from './pipeline';

describe('RAGPipeline', () => {
  let pipeline: RAGPipeline;

  beforeEach(() => {
    vi.clearAllMocks();
    pipeline = new RAGPipeline();
  });

  describe('retrieveContext', () => {
    it('should embed the query text using embeddingService.embedText', async () => {
      mockEmbeddingService.embedText.mockResolvedValue([0.1, 0.2, 0.3]);
      mockVectorStore.similaritySearch.mockResolvedValue([]);

      await pipeline.retrieveContext({
        query: 'What is AI?',
        knowledgeBaseId: 'kb-1',
      });

      expect(mockEmbeddingService.embedText).toHaveBeenCalledWith('What is AI?');
    });

    it('should call vectorStore.similaritySearch with the embedding and knowledgeBaseId', async () => {
      mockEmbeddingService.embedText.mockResolvedValue([0.1, 0.2, 0.3]);
      mockVectorStore.similaritySearch.mockResolvedValue([]);

      await pipeline.retrieveContext({
        query: 'What is AI?',
        knowledgeBaseId: 'kb-1',
      });

      expect(mockVectorStore.similaritySearch).toHaveBeenCalledWith({
        embedding: [0.1, 0.2, 0.3],
        knowledgeBaseId: 'kb-1',
        topK: undefined,
      });
    });

    it('should return matching entries with similarity scores', async () => {
      mockEmbeddingService.embedText.mockResolvedValue([0.1, 0.2, 0.3]);
      mockVectorStore.similaritySearch.mockResolvedValue([
        { id: 'e1', title: 'Doc 1 [1/2]', content: 'Context about AI...', similarity: 0.95 },
        { id: 'e2', title: 'Doc 2 [1/1]', content: 'More about ML...', similarity: 0.88 },
      ]);

      const results = await pipeline.retrieveContext({
        query: 'What is AI?',
        knowledgeBaseId: 'kb-1',
      });

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        id: 'e1',
        title: 'Doc 1 [1/2]',
        content: 'Context about AI...',
        similarity: 0.95,
      });
      expect(results[1]).toEqual({
        id: 'e2',
        title: 'Doc 2 [1/1]',
        content: 'More about ML...',
        similarity: 0.88,
      });
    });

    it('should respect topK parameter (default 5 when not provided)', async () => {
      mockEmbeddingService.embedText.mockResolvedValue([0.1, 0.2, 0.3]);
      mockVectorStore.similaritySearch.mockResolvedValue([]);

      // Without topK - should pass undefined, letting VectorStore use its default (5)
      await pipeline.retrieveContext({
        query: 'test query',
        knowledgeBaseId: 'kb-1',
      });

      expect(mockVectorStore.similaritySearch).toHaveBeenCalledWith(
        expect.objectContaining({ topK: undefined })
      );

      vi.clearAllMocks();
      mockEmbeddingService.embedText.mockResolvedValue([0.1, 0.2, 0.3]);
      mockVectorStore.similaritySearch.mockResolvedValue([]);

      // With topK = 3
      await pipeline.retrieveContext({
        query: 'test query',
        knowledgeBaseId: 'kb-1',
        topK: 3,
      });

      expect(mockVectorStore.similaritySearch).toHaveBeenCalledWith(
        expect.objectContaining({ topK: 3 })
      );
    });
  });

  describe('generateWithContext', () => {
    it('should call generateText with context-augmented system prompt', async () => {
      mockGenerateText.mockResolvedValue({ text: 'AI is a field of computer science...' });

      await pipeline.generateWithContext({
        query: 'What is AI?',
        contexts: [
          { id: 'e1', title: 'Doc 1', content: 'Context about AI...', similarity: 0.95 },
        ],
      });

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          model: { modelId: 'claude-sonnet' },
          prompt: 'What is AI?',
          maxOutputTokens: 4096,
        })
      );
    });

    it('should include all context entries content in the system prompt', async () => {
      mockGenerateText.mockResolvedValue({ text: 'Response...' });

      await pipeline.generateWithContext({
        query: 'Tell me about AI and ML',
        contexts: [
          { id: 'e1', title: 'Doc 1', content: 'Context about AI...', similarity: 0.95 },
          { id: 'e2', title: 'Doc 2', content: 'More about ML...', similarity: 0.88 },
        ],
      });

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          system: expect.stringContaining('Context about AI...'),
        })
      );
      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          system: expect.stringContaining('More about ML...'),
        })
      );
    });

    it('should return answer from LLM and sources list', async () => {
      mockGenerateText.mockResolvedValue({ text: 'AI is a field of computer science...' });

      const result = await pipeline.generateWithContext({
        query: 'What is AI?',
        contexts: [
          { id: 'e1', title: 'Doc 1', content: 'Context about AI...', similarity: 0.95 },
          { id: 'e2', title: 'Doc 2', content: 'More about ML...', similarity: 0.88 },
        ],
      });

      expect(result.answer).toBe('AI is a field of computer science...');
      expect(result.sources).toEqual([
        { title: 'Doc 1', similarity: 0.95 },
        { title: 'Doc 2', similarity: 0.88 },
      ]);
    });

    it('should handle empty contexts array (still generates, just no context)', async () => {
      mockGenerateText.mockResolvedValue({ text: 'I don\'t have specific context...' });

      const result = await pipeline.generateWithContext({
        query: 'What is AI?',
        contexts: [],
      });

      expect(mockGenerateText).toHaveBeenCalledTimes(1);
      expect(result.answer).toBe('I don\'t have specific context...');
      expect(result.sources).toEqual([]);

      // Verify system prompt does NOT contain 'Context:' section
      const systemPrompt = mockGenerateText.mock.calls[0][0].system;
      expect(systemPrompt).not.toContain('Context:');
    });
  });

  describe('query', () => {
    it('should call retrieveContext then generateWithContext', async () => {
      mockEmbeddingService.embedText.mockResolvedValue([0.1, 0.2, 0.3]);
      mockVectorStore.similaritySearch.mockResolvedValue([
        { id: 'e1', title: 'Doc 1', content: 'Context about AI...', similarity: 0.95 },
      ]);
      mockGenerateText.mockResolvedValue({ text: 'AI answer...' });

      await pipeline.query({
        query: 'What is AI?',
        knowledgeBaseId: 'kb-1',
      });

      // Verify retrieveContext was called (embedText + similaritySearch)
      expect(mockEmbeddingService.embedText).toHaveBeenCalledWith('What is AI?');
      expect(mockVectorStore.similaritySearch).toHaveBeenCalledTimes(1);

      // Verify generateWithContext was called (generateText)
      expect(mockGenerateText).toHaveBeenCalledTimes(1);
      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          system: expect.stringContaining('Context about AI...'),
          prompt: 'What is AI?',
        })
      );
    });

    it('should return answer, sources, and contexts', async () => {
      const mockContexts = [
        { id: 'e1', title: 'Doc 1', content: 'Context about AI...', similarity: 0.95 },
        { id: 'e2', title: 'Doc 2', content: 'More about ML...', similarity: 0.88 },
      ];
      mockEmbeddingService.embedText.mockResolvedValue([0.1, 0.2, 0.3]);
      mockVectorStore.similaritySearch.mockResolvedValue(mockContexts);
      mockGenerateText.mockResolvedValue({ text: 'AI is fascinating...' });

      const result = await pipeline.query({
        query: 'What is AI?',
        knowledgeBaseId: 'kb-1',
      });

      expect(result.answer).toBe('AI is fascinating...');
      expect(result.sources).toEqual([
        { title: 'Doc 1', similarity: 0.95 },
        { title: 'Doc 2', similarity: 0.88 },
      ]);
      expect(result.contexts).toEqual(mockContexts);
    });

    it('should pass through topK and modelId options', async () => {
      mockEmbeddingService.embedText.mockResolvedValue([0.1, 0.2, 0.3]);
      mockVectorStore.similaritySearch.mockResolvedValue([]);
      mockGenerateText.mockResolvedValue({ text: 'Answer...' });

      await pipeline.query({
        query: 'test query',
        knowledgeBaseId: 'kb-1',
        topK: 3,
        modelId: 'claude-sonnet',
      });

      // topK should be passed to similaritySearch
      expect(mockVectorStore.similaritySearch).toHaveBeenCalledWith(
        expect.objectContaining({ topK: 3 })
      );

      // modelId should be used in generateText (model selection)
      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          model: { modelId: 'claude-sonnet' },
        })
      );
    });

    it('should return empty sources when no context found', async () => {
      mockEmbeddingService.embedText.mockResolvedValue([0.1, 0.2, 0.3]);
      mockVectorStore.similaritySearch.mockResolvedValue([]);
      mockGenerateText.mockResolvedValue({ text: 'No specific context available...' });

      const result = await pipeline.query({
        query: 'Obscure question',
        knowledgeBaseId: 'kb-1',
      });

      expect(result.answer).toBe('No specific context available...');
      expect(result.sources).toEqual([]);
      expect(result.contexts).toEqual([]);
    });
  });
});
