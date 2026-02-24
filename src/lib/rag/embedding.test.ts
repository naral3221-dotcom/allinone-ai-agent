import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockEmbed, mockEmbedMany } = vi.hoisted(() => ({
  mockEmbed: vi.fn(),
  mockEmbedMany: vi.fn(),
}));

vi.mock('ai', () => ({
  embed: mockEmbed,
  embedMany: mockEmbedMany,
}));

vi.mock('@ai-sdk/openai', () => ({
  openai: {
    embedding: vi.fn(() => 'mock-embedding-model'),
  },
}));

import { EmbeddingService } from './embedding';

describe('EmbeddingService', () => {
  let service: EmbeddingService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new EmbeddingService();
  });

  describe('embedText', () => {
    it('should call ai embed and return embedding array', async () => {
      const mockEmbedding = [0.1, 0.2, 0.3, ...new Array(1533).fill(0)];
      mockEmbed.mockResolvedValue({ embedding: mockEmbedding });

      const result = await service.embedText('Hello world');

      expect(mockEmbed).toHaveBeenCalledWith({
        model: 'mock-embedding-model',
        value: 'Hello world',
      });
      expect(result).toEqual(mockEmbedding);
      expect(result).toHaveLength(1536);
    });

    it('should use configured model (text-embedding-3-small)', async () => {
      const { openai } = await import('@ai-sdk/openai');
      const mockEmbedding = [0.5, 0.6, 0.7, ...new Array(1533).fill(0)];
      mockEmbed.mockResolvedValue({ embedding: mockEmbedding });

      await service.embedText('Test input');

      expect(openai.embedding).toHaveBeenCalledWith('text-embedding-3-small');
    });
  });

  describe('embedBatch', () => {
    it('should call ai embedMany and return array of embeddings', async () => {
      const embedding1 = [0.1, 0.2, ...new Array(1534).fill(0)];
      const embedding2 = [0.3, 0.4, ...new Array(1534).fill(0)];
      mockEmbedMany.mockResolvedValue({
        embeddings: [embedding1, embedding2],
      });

      const result = await service.embedBatch(['text one', 'text two']);

      expect(mockEmbedMany).toHaveBeenCalledWith({
        model: 'mock-embedding-model',
        values: ['text one', 'text two'],
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(embedding1);
      expect(result[1]).toEqual(embedding2);
    });

    it('should handle empty input array', async () => {
      const result = await service.embedBatch([]);

      expect(result).toEqual([]);
      expect(mockEmbedMany).not.toHaveBeenCalled();
    });
  });

  describe('getEmbeddingDimension', () => {
    it('should return 1536 (default)', () => {
      const dimension = service.getEmbeddingDimension();
      expect(dimension).toBe(1536);
    });

    it('should return custom dimension if configured', () => {
      const customService = new EmbeddingService({ dimension: 768 });
      expect(customService.getEmbeddingDimension()).toBe(768);
    });
  });
});
