import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      document: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    },
  };
});

vi.mock('./prisma', () => ({
  prisma: mockPrisma,
}));

import { DocumentService } from './document.service';

describe('DocumentService', () => {
  const service = new DocumentService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // create
  // ---------------------------------------------------------------------------

  describe('create', () => {
    it('should create a document with title, content, userId, and type', async () => {
      const doc = {
        id: 'doc-1',
        userId: 'user-1',
        title: 'My Document',
        content: { type: 'doc', content: [] },
        type: 'document',
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.document.create.mockResolvedValue(doc);

      const result = await service.create({
        userId: 'user-1',
        title: 'My Document',
        content: { type: 'doc', content: [] },
        type: 'document',
      });

      expect(result).toEqual(doc);
      expect(mockPrisma.document.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          title: 'My Document',
          content: { type: 'doc', content: [] },
          type: 'document',
        },
      });
    });

    it('should create a document with optional tags', async () => {
      const doc = {
        id: 'doc-2',
        userId: 'user-1',
        title: 'Tagged Document',
        content: { type: 'doc', content: [] },
        type: 'note',
        tags: ['important', 'draft'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.document.create.mockResolvedValue(doc);

      const result = await service.create({
        userId: 'user-1',
        title: 'Tagged Document',
        content: { type: 'doc', content: [] },
        type: 'note',
        tags: ['important', 'draft'],
      });

      expect(result).toEqual(doc);
      expect(mockPrisma.document.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          title: 'Tagged Document',
          content: { type: 'doc', content: [] },
          type: 'note',
          tags: ['important', 'draft'],
        },
      });
    });
  });

  // ---------------------------------------------------------------------------
  // list
  // ---------------------------------------------------------------------------

  describe('list', () => {
    it('should list documents for a user ordered by updatedAt desc', async () => {
      const docs = [
        { id: 'doc-2', title: 'Second', updatedAt: new Date('2026-02-23') },
        { id: 'doc-1', title: 'First', updatedAt: new Date('2026-02-22') },
      ];
      mockPrisma.document.findMany.mockResolvedValue(docs);

      const result = await service.list('user-1');

      expect(result).toHaveLength(2);
      expect(mockPrisma.document.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { updatedAt: 'desc' },
        take: 50,
      });
    });

    it('should filter documents by type', async () => {
      const docs = [{ id: 'doc-1', title: 'Note', type: 'note' }];
      mockPrisma.document.findMany.mockResolvedValue(docs);

      const result = await service.list('user-1', { type: 'note' });

      expect(result).toHaveLength(1);
      expect(mockPrisma.document.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', type: 'note' },
        orderBy: { updatedAt: 'desc' },
        take: 50,
      });
    });

    it('should return empty array when user has no documents', async () => {
      mockPrisma.document.findMany.mockResolvedValue([]);

      const result = await service.list('user-1');

      expect(result).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  // get
  // ---------------------------------------------------------------------------

  describe('get', () => {
    it('should get a document by id', async () => {
      const doc = {
        id: 'doc-1',
        userId: 'user-1',
        title: 'My Document',
        content: { type: 'doc', content: [] },
        type: 'document',
        tags: [],
      };
      mockPrisma.document.findUnique.mockResolvedValue(doc);

      const result = await service.get('doc-1');

      expect(result).toEqual(doc);
      expect(mockPrisma.document.findUnique).toHaveBeenCalledWith({
        where: { id: 'doc-1' },
      });
    });

    it('should return null for non-existent document', async () => {
      mockPrisma.document.findUnique.mockResolvedValue(null);

      const result = await service.get('non-existent');

      expect(result).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // update
  // ---------------------------------------------------------------------------

  describe('update', () => {
    it('should update title and content', async () => {
      const updated = {
        id: 'doc-1',
        title: 'Updated Title',
        content: { type: 'doc', content: [{ type: 'paragraph', text: 'New' }] },
      };
      mockPrisma.document.update.mockResolvedValue(updated);

      const result = await service.update('doc-1', {
        title: 'Updated Title',
        content: { type: 'doc', content: [{ type: 'paragraph', text: 'New' }] },
      });

      expect(result).toEqual(updated);
      expect(mockPrisma.document.update).toHaveBeenCalledWith({
        where: { id: 'doc-1' },
        data: {
          title: 'Updated Title',
          content: { type: 'doc', content: [{ type: 'paragraph', text: 'New' }] },
        },
      });
    });

    it('should update tags', async () => {
      const updated = {
        id: 'doc-1',
        tags: ['final', 'reviewed'],
      };
      mockPrisma.document.update.mockResolvedValue(updated);

      const result = await service.update('doc-1', {
        tags: ['final', 'reviewed'],
      });

      expect(result).toEqual(updated);
      expect(mockPrisma.document.update).toHaveBeenCalledWith({
        where: { id: 'doc-1' },
        data: {
          tags: ['final', 'reviewed'],
        },
      });
    });
  });

  // ---------------------------------------------------------------------------
  // delete
  // ---------------------------------------------------------------------------

  describe('delete', () => {
    it('should delete a document by id', async () => {
      mockPrisma.document.delete.mockResolvedValue({ id: 'doc-1' });

      await service.delete('doc-1');

      expect(mockPrisma.document.delete).toHaveBeenCalledWith({
        where: { id: 'doc-1' },
      });
    });
  });

  // ---------------------------------------------------------------------------
  // search
  // ---------------------------------------------------------------------------

  describe('search', () => {
    it('should search documents by title keyword using contains', async () => {
      const docs = [
        { id: 'doc-1', title: 'Meeting Notes for Q1', type: 'note' },
        { id: 'doc-2', title: 'Meeting Summary', type: 'document' },
      ];
      mockPrisma.document.findMany.mockResolvedValue(docs);

      const result = await service.search('user-1', 'Meeting');

      expect(result).toHaveLength(2);
      expect(mockPrisma.document.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          title: { contains: 'Meeting', mode: 'insensitive' },
        },
        orderBy: { updatedAt: 'desc' },
        take: 50,
      });
    });

    it('should return empty array when no documents match the search', async () => {
      mockPrisma.document.findMany.mockResolvedValue([]);

      const result = await service.search('user-1', 'NonExistent');

      expect(result).toEqual([]);
    });
  });
});
