import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
    knowledgeEntry: {
      create: vi.fn(),
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: mockPrisma,
}));

import { VectorStore } from './vector-store';

describe('VectorStore', () => {
  let store: VectorStore;

  beforeEach(() => {
    vi.clearAllMocks();
    store = new VectorStore();
  });

  describe('upsertEntry', () => {
    const baseInput = {
      id: 'entry-1',
      knowledgeBaseId: 'kb-1',
      title: 'Test Title',
      content: 'Test content for embedding',
      sourceType: 'text',
      embedding: [0.1, 0.2, 0.3],
    };

    it('should create a knowledge entry with embedding via $executeRaw', async () => {
      mockPrisma.$executeRaw.mockResolvedValue(1);

      await store.upsertEntry(baseInput);

      expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
    });

    it('should store the entry content, title, sourceType, and knowledgeBaseId', async () => {
      mockPrisma.$executeRaw.mockResolvedValue(1);

      await store.upsertEntry({
        id: 'entry-2',
        knowledgeBaseId: 'kb-42',
        title: 'My Document',
        content: 'Some important content',
        sourceType: 'pdf',
        sourceUrl: 'https://example.com/doc.pdf',
        embedding: [0.5, 0.6],
        metadata: { pages: 10 },
      });

      expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);

      // Verify the tagged template was called with the correct values embedded.
      // Tagged template calls pass (strings[], ...values), so we can inspect
      // the call args. The values array contains the interpolated parameters.
      const callArgs = mockPrisma.$executeRaw.mock.calls[0];
      // callArgs[0] is the TemplateStringsArray (or Prisma.Sql), remaining are values
      // For tagged template literals, the first arg is the strings array,
      // and subsequent args are the interpolated values.
      const values = callArgs.slice(1);

      expect(values).toContain('entry-2');
      expect(values).toContain('kb-42');
      expect(values).toContain('My Document');
      expect(values).toContain('Some important content');
      expect(values).toContain('pdf');
      expect(values).toContain('https://example.com/doc.pdf');
    });

    it('should format the embedding vector correctly for pgvector', async () => {
      mockPrisma.$executeRaw.mockResolvedValue(1);

      const embedding = [0.1, 0.2, 0.3, 0.4];
      await store.upsertEntry({ ...baseInput, embedding });

      const callArgs = mockPrisma.$executeRaw.mock.calls[0];
      const values = callArgs.slice(1);

      // The embedding should be formatted as "[0.1,0.2,0.3,0.4]"
      const embeddingStr = values.find(
        (v: unknown) => typeof v === 'string' && v.startsWith('[') && v.endsWith(']')
      );
      expect(embeddingStr).toBe('[0.1,0.2,0.3,0.4]');
    });

    it('should handle null sourceUrl and metadata', async () => {
      mockPrisma.$executeRaw.mockResolvedValue(1);

      await store.upsertEntry({
        ...baseInput,
        sourceUrl: undefined,
        metadata: undefined,
      });

      expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
      // Should not throw when optional fields are omitted
    });
  });

  describe('similaritySearch', () => {
    const baseSearchInput = {
      embedding: [0.1, 0.2, 0.3],
      knowledgeBaseId: 'kb-1',
    };

    it('should query for similar entries using cosine distance via $queryRaw', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { id: 'entry-1', title: 'Title 1', content: 'Content 1', similarity: 0.95 },
      ]);

      await store.similaritySearch(baseSearchInput);

      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should return entries with similarity scores', async () => {
      const mockResults = [
        { id: 'entry-1', title: 'Title 1', content: 'Content 1', similarity: 0.95 },
        { id: 'entry-2', title: 'Title 2', content: 'Content 2', similarity: 0.87 },
      ];
      mockPrisma.$queryRaw.mockResolvedValue(mockResults);

      const results = await store.similaritySearch(baseSearchInput);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        id: 'entry-1',
        title: 'Title 1',
        content: 'Content 1',
        similarity: 0.95,
      });
      expect(results[1]).toEqual({
        id: 'entry-2',
        title: 'Title 2',
        content: 'Content 2',
        similarity: 0.87,
      });
    });

    it('should respect the topK parameter (default 5)', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);

      // Default topK = 5
      await store.similaritySearch(baseSearchInput);

      let callArgs = mockPrisma.$queryRaw.mock.calls[0];
      let values = callArgs.slice(1);
      expect(values).toContain(5);

      vi.clearAllMocks();

      // Custom topK = 10
      await store.similaritySearch({ ...baseSearchInput, topK: 10 });

      callArgs = mockPrisma.$queryRaw.mock.calls[0];
      values = callArgs.slice(1);
      expect(values).toContain(10);
    });

    it('should filter by knowledgeBaseId', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);

      await store.similaritySearch({
        ...baseSearchInput,
        knowledgeBaseId: 'kb-specific',
      });

      const callArgs = mockPrisma.$queryRaw.mock.calls[0];
      const values = callArgs.slice(1);
      expect(values).toContain('kb-specific');
    });
  });

  describe('deleteByKnowledgeBase', () => {
    it('should delete all entries for a knowledge base', async () => {
      mockPrisma.knowledgeEntry.deleteMany.mockResolvedValue({ count: 5 });

      await store.deleteByKnowledgeBase('kb-1');

      expect(mockPrisma.knowledgeEntry.deleteMany).toHaveBeenCalledTimes(1);
    });

    it('should use knowledgeEntry.deleteMany with knowledgeBaseId filter', async () => {
      mockPrisma.knowledgeEntry.deleteMany.mockResolvedValue({ count: 3 });

      await store.deleteByKnowledgeBase('kb-42');

      expect(mockPrisma.knowledgeEntry.deleteMany).toHaveBeenCalledWith({
        where: { knowledgeBaseId: 'kb-42' },
      });
    });
  });

  describe('getEntriesByKnowledgeBase', () => {
    it('should list all entries for a knowledge base', async () => {
      const mockEntries = [
        { id: 'e1', title: 'Doc 1', content: 'Content 1', sourceType: 'text' },
        { id: 'e2', title: 'Doc 2', content: 'Content 2', sourceType: 'pdf' },
      ];
      mockPrisma.knowledgeEntry.findMany.mockResolvedValue(mockEntries);

      const results = await store.getEntriesByKnowledgeBase('kb-1');

      expect(results).toHaveLength(2);
      expect(results).toEqual(mockEntries);
      expect(mockPrisma.knowledgeEntry.findMany).toHaveBeenCalledWith({
        where: { knowledgeBaseId: 'kb-1' },
        select: { id: true, title: true, content: true, sourceType: true },
      });
    });

    it('should return empty array when no entries exist', async () => {
      mockPrisma.knowledgeEntry.findMany.mockResolvedValue([]);

      const results = await store.getEntriesByKnowledgeBase('kb-empty');

      expect(results).toEqual([]);
      expect(mockPrisma.knowledgeEntry.findMany).toHaveBeenCalledWith({
        where: { knowledgeBaseId: 'kb-empty' },
        select: { id: true, title: true, content: true, sourceType: true },
      });
    });
  });
});
