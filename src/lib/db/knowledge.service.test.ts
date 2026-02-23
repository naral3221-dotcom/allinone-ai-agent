import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    knowledgeBase: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    knowledgeEntry: {
      count: vi.fn(),
    },
  },
}));

vi.mock('./prisma', () => ({
  prisma: mockPrisma,
}));

const { mockEmbeddingService } = vi.hoisted(() => ({
  mockEmbeddingService: {
    embedBatch: vi.fn(),
    getEmbeddingDimension: vi.fn(() => 1536),
  },
}));

const { mockVectorStore } = vi.hoisted(() => ({
  mockVectorStore: {
    upsertEntry: vi.fn(),
    deleteByKnowledgeBase: vi.fn(),
    getEntriesByKnowledgeBase: vi.fn(),
  },
}));

const { mockSplitText } = vi.hoisted(() => ({
  mockSplitText: vi.fn(),
}));

vi.mock('@/lib/rag/embedding', () => ({
  EmbeddingService: class {
    embedBatch = mockEmbeddingService.embedBatch;
    getEmbeddingDimension = mockEmbeddingService.getEmbeddingDimension;
  },
}));

vi.mock('@/lib/rag/vector-store', () => ({
  VectorStore: class {
    upsertEntry = mockVectorStore.upsertEntry;
    deleteByKnowledgeBase = mockVectorStore.deleteByKnowledgeBase;
    getEntriesByKnowledgeBase = mockVectorStore.getEntriesByKnowledgeBase;
  },
}));

vi.mock('@/lib/rag/chunker', () => ({
  splitText: mockSplitText,
}));

import { KnowledgeBaseService } from './knowledge.service';

describe('KnowledgeBaseService', () => {
  let service: KnowledgeBaseService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new KnowledgeBaseService();
  });

  describe('createKnowledgeBase', () => {
    it('should create a knowledge base with name and userId', async () => {
      const kb = { id: 'kb-1', userId: 'user-1', name: 'My KB', description: null };
      mockPrisma.knowledgeBase.create.mockResolvedValue(kb);

      await service.createKnowledgeBase('user-1', 'My KB');

      expect(mockPrisma.knowledgeBase.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', name: 'My KB' },
      });
    });

    it('should create with optional description', async () => {
      const kb = { id: 'kb-1', userId: 'user-1', name: 'My KB', description: 'A description' };
      mockPrisma.knowledgeBase.create.mockResolvedValue(kb);

      await service.createKnowledgeBase('user-1', 'My KB', 'A description');

      expect(mockPrisma.knowledgeBase.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', name: 'My KB', description: 'A description' },
      });
    });

    it('should return the created knowledge base object', async () => {
      const kb = { id: 'kb-1', userId: 'user-1', name: 'My KB', description: null };
      mockPrisma.knowledgeBase.create.mockResolvedValue(kb);

      const result = await service.createKnowledgeBase('user-1', 'My KB');

      expect(result).toEqual(kb);
    });
  });

  describe('listKnowledgeBases', () => {
    it('should list knowledge bases for a user', async () => {
      const kbs = [
        { id: 'kb-1', name: 'First' },
        { id: 'kb-2', name: 'Second' },
      ];
      mockPrisma.knowledgeBase.findMany.mockResolvedValue(kbs);

      const result = await service.listKnowledgeBases('user-1');

      expect(result).toHaveLength(2);
      expect(mockPrisma.knowledgeBase.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { updatedAt: 'desc' },
      });
    });

    it('should return empty array when none exist', async () => {
      mockPrisma.knowledgeBase.findMany.mockResolvedValue([]);

      const result = await service.listKnowledgeBases('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('getKnowledgeBase', () => {
    it('should get a knowledge base by id with entries included', async () => {
      const kb = {
        id: 'kb-1',
        name: 'My KB',
        entries: [{ id: 'entry-1', title: 'Entry 1' }],
      };
      mockPrisma.knowledgeBase.findUnique.mockResolvedValue(kb);

      const result = await service.getKnowledgeBase('kb-1');

      expect(result).toEqual(kb);
      expect(result?.entries).toHaveLength(1);
      expect(mockPrisma.knowledgeBase.findUnique).toHaveBeenCalledWith({
        where: { id: 'kb-1' },
        include: { entries: true },
      });
    });

    it('should return null for non-existent id', async () => {
      mockPrisma.knowledgeBase.findUnique.mockResolvedValue(null);

      const result = await service.getKnowledgeBase('missing-id');

      expect(result).toBeNull();
    });
  });

  describe('deleteKnowledgeBase', () => {
    it('should delete knowledge base from DB', async () => {
      mockVectorStore.deleteByKnowledgeBase.mockResolvedValue(undefined);
      mockPrisma.knowledgeBase.delete.mockResolvedValue({ id: 'kb-1' });

      await service.deleteKnowledgeBase('kb-1');

      expect(mockPrisma.knowledgeBase.delete).toHaveBeenCalledWith({
        where: { id: 'kb-1' },
      });
    });

    it('should also delete vectors from vector store', async () => {
      mockVectorStore.deleteByKnowledgeBase.mockResolvedValue(undefined);
      mockPrisma.knowledgeBase.delete.mockResolvedValue({ id: 'kb-1' });

      await service.deleteKnowledgeBase('kb-1');

      expect(mockVectorStore.deleteByKnowledgeBase).toHaveBeenCalledWith('kb-1');
    });
  });

  describe('addEntry', () => {
    const baseInput = {
      knowledgeBaseId: 'kb-1',
      title: 'Test Document',
      content: 'Some long content that will be chunked',
      sourceType: 'text',
    };

    beforeEach(() => {
      mockSplitText.mockReturnValue(['chunk 1 text', 'chunk 2 text', 'chunk 3 text']);
      mockEmbeddingService.embedBatch.mockResolvedValue([
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.6],
        [0.7, 0.8, 0.9],
      ]);
      mockVectorStore.upsertEntry.mockResolvedValue(undefined);
    });

    it('should split content into chunks using splitText', async () => {
      await service.addEntry(baseInput);

      expect(mockSplitText).toHaveBeenCalledWith(baseInput.content);
    });

    it('should generate embeddings for all chunks via embedBatch', async () => {
      await service.addEntry(baseInput);

      expect(mockEmbeddingService.embedBatch).toHaveBeenCalledWith([
        'chunk 1 text',
        'chunk 2 text',
        'chunk 3 text',
      ]);
    });

    it('should store each chunk as a vector entry via upsertEntry', async () => {
      await service.addEntry(baseInput);

      expect(mockVectorStore.upsertEntry).toHaveBeenCalledTimes(3);

      // Verify each call includes the correct data
      for (let i = 0; i < 3; i++) {
        const call = mockVectorStore.upsertEntry.mock.calls[i][0];
        expect(call.knowledgeBaseId).toBe('kb-1');
        expect(call.content).toBe(['chunk 1 text', 'chunk 2 text', 'chunk 3 text'][i]);
        expect(call.embedding).toEqual([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6], [0.7, 0.8, 0.9]][i]);
        expect(call.title).toBe(`Test Document [${i + 1}/3]`);
        expect(call.sourceType).toBe('text');
      }
    });

    it('should return the number of chunks created', async () => {
      const result = await service.addEntry(baseInput);

      expect(result).toEqual({ chunksCreated: 3 });
    });

    it('should handle single-chunk content correctly', async () => {
      mockSplitText.mockReturnValue(['single chunk']);
      mockEmbeddingService.embedBatch.mockResolvedValue([[0.1, 0.2, 0.3]]);

      const result = await service.addEntry({
        ...baseInput,
        content: 'short content',
      });

      expect(result).toEqual({ chunksCreated: 1 });
      expect(mockVectorStore.upsertEntry).toHaveBeenCalledTimes(1);

      const call = mockVectorStore.upsertEntry.mock.calls[0][0];
      expect(call.title).toBe('Test Document [1/1]');
      expect(call.content).toBe('single chunk');
      expect(call.embedding).toEqual([0.1, 0.2, 0.3]);
    });
  });

  describe('getEntryCount', () => {
    it('should return count of entries for a knowledge base', async () => {
      mockPrisma.knowledgeEntry.count.mockResolvedValue(5);

      const result = await service.getEntryCount('kb-1');

      expect(result).toBe(5);
      expect(mockPrisma.knowledgeEntry.count).toHaveBeenCalledWith({
        where: { knowledgeBaseId: 'kb-1' },
      });
    });

    it('should return 0 when no entries exist', async () => {
      mockPrisma.knowledgeEntry.count.mockResolvedValue(0);

      const result = await service.getEntryCount('kb-1');

      expect(result).toBe(0);
    });
  });
});
