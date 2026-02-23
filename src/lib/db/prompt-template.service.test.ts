import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks (hoisted to top so vi.mock calls resolve correctly)
// ---------------------------------------------------------------------------

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    promptTemplate: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('./prisma', () => ({
  prisma: mockPrisma,
}));

// ---------------------------------------------------------------------------
// System under test
// ---------------------------------------------------------------------------

import { PromptTemplateService } from './prompt-template.service';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PromptTemplateService', () => {
  const service = new PromptTemplateService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // create
  // -------------------------------------------------------------------------

  describe('create', () => {
    it('should create a template with name, content, and userId', async () => {
      const template = {
        id: 'tmpl-1',
        userId: 'user-1',
        name: 'Greeting',
        content: 'Hello, world!',
        category: 'general',
        variables: [],
        isPublic: false,
      };
      mockPrisma.promptTemplate.create.mockResolvedValue(template);

      const result = await service.create({
        userId: 'user-1',
        name: 'Greeting',
        content: 'Hello, world!',
      });

      expect(result).toEqual(template);
      expect(mockPrisma.promptTemplate.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          name: 'Greeting',
          content: 'Hello, world!',
          variables: [],
        },
      });
    });

    it('should auto-extract variables from {{variable}} pattern in content', async () => {
      const template = {
        id: 'tmpl-2',
        userId: 'user-1',
        name: 'Email Template',
        content: 'Dear {{name}}, your order {{orderId}} is ready.',
        variables: ['name', 'orderId'],
        category: 'email',
        isPublic: false,
      };
      mockPrisma.promptTemplate.create.mockResolvedValue(template);

      const result = await service.create({
        userId: 'user-1',
        name: 'Email Template',
        content: 'Dear {{name}}, your order {{orderId}} is ready.',
        category: 'email',
      });

      expect(result).toEqual(template);
      expect(mockPrisma.promptTemplate.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          name: 'Email Template',
          content: 'Dear {{name}}, your order {{orderId}} is ready.',
          category: 'email',
          variables: ['name', 'orderId'],
        },
      });
    });
  });

  // -------------------------------------------------------------------------
  // list
  // -------------------------------------------------------------------------

  describe('list', () => {
    it('should list templates for a user (includes own + public)', async () => {
      const templates = [
        { id: 'tmpl-1', userId: 'user-1', name: 'My Template', isPublic: false },
        { id: 'tmpl-2', userId: 'user-2', name: 'Public Template', isPublic: true },
      ];
      mockPrisma.promptTemplate.findMany.mockResolvedValue(templates);

      const result = await service.list('user-1');

      expect(result).toHaveLength(2);
      expect(mockPrisma.promptTemplate.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { userId: 'user-1' },
            { isPublic: true },
          ],
        },
        orderBy: { updatedAt: 'desc' },
      });
    });

    it('should filter by category when provided', async () => {
      const templates = [
        { id: 'tmpl-1', userId: 'user-1', name: 'Email 1', category: 'email' },
      ];
      mockPrisma.promptTemplate.findMany.mockResolvedValue(templates);

      const result = await service.list('user-1', { category: 'email' });

      expect(result).toHaveLength(1);
      expect(mockPrisma.promptTemplate.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { userId: 'user-1' },
            { isPublic: true },
          ],
          category: 'email',
        },
        orderBy: { updatedAt: 'desc' },
      });
    });

    it('should include public templates from other users', async () => {
      const templates = [
        { id: 'tmpl-1', userId: 'user-1', name: 'My Template', isPublic: false },
        { id: 'tmpl-2', userId: 'user-other', name: 'Shared Template', isPublic: true },
      ];
      mockPrisma.promptTemplate.findMany.mockResolvedValue(templates);

      const result = await service.list('user-1');

      expect(result).toHaveLength(2);
      // Verify the OR condition includes public templates
      const callArgs = mockPrisma.promptTemplate.findMany.mock.calls[0][0];
      expect(callArgs.where.OR).toContainEqual({ isPublic: true });
    });
  });

  // -------------------------------------------------------------------------
  // get
  // -------------------------------------------------------------------------

  describe('get', () => {
    it('should get a template by id', async () => {
      const template = {
        id: 'tmpl-1',
        userId: 'user-1',
        name: 'My Template',
        content: 'Hello {{name}}',
        variables: ['name'],
      };
      mockPrisma.promptTemplate.findUnique.mockResolvedValue(template);

      const result = await service.get('tmpl-1');

      expect(result).toEqual(template);
      expect(mockPrisma.promptTemplate.findUnique).toHaveBeenCalledWith({
        where: { id: 'tmpl-1' },
      });
    });

    it('should return null for non-existent template', async () => {
      mockPrisma.promptTemplate.findUnique.mockResolvedValue(null);

      const result = await service.get('non-existent');

      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // update
  // -------------------------------------------------------------------------

  describe('update', () => {
    it('should update template fields', async () => {
      const updated = {
        id: 'tmpl-1',
        name: 'Updated Name',
        description: 'Updated description',
        category: 'research',
      };
      mockPrisma.promptTemplate.update.mockResolvedValue(updated);

      const result = await service.update('tmpl-1', {
        name: 'Updated Name',
        description: 'Updated description',
        category: 'research',
      });

      expect(result).toEqual(updated);
      expect(mockPrisma.promptTemplate.update).toHaveBeenCalledWith({
        where: { id: 'tmpl-1' },
        data: {
          name: 'Updated Name',
          description: 'Updated description',
          category: 'research',
        },
      });
    });

    it('should re-extract variables when content is updated', async () => {
      const updated = {
        id: 'tmpl-1',
        content: 'Hi {{firstName}} {{lastName}}',
        variables: ['firstName', 'lastName'],
      };
      mockPrisma.promptTemplate.update.mockResolvedValue(updated);

      const result = await service.update('tmpl-1', {
        content: 'Hi {{firstName}} {{lastName}}',
      });

      expect(result).toEqual(updated);
      expect(mockPrisma.promptTemplate.update).toHaveBeenCalledWith({
        where: { id: 'tmpl-1' },
        data: {
          content: 'Hi {{firstName}} {{lastName}}',
          variables: ['firstName', 'lastName'],
        },
      });
    });
  });

  // -------------------------------------------------------------------------
  // delete
  // -------------------------------------------------------------------------

  describe('delete', () => {
    it('should delete a template by id', async () => {
      mockPrisma.promptTemplate.delete.mockResolvedValue({ id: 'tmpl-1' });

      await service.delete('tmpl-1');

      expect(mockPrisma.promptTemplate.delete).toHaveBeenCalledWith({
        where: { id: 'tmpl-1' },
      });
    });
  });

  // -------------------------------------------------------------------------
  // renderTemplate
  // -------------------------------------------------------------------------

  describe('renderTemplate', () => {
    it('should replace {{variable}} with provided values', () => {
      const result = service.renderTemplate(
        'Hello {{name}}!',
        { name: 'Alice' }
      );

      expect(result).toBe('Hello Alice!');
    });

    it('should handle multiple variables', () => {
      const result = service.renderTemplate(
        'Dear {{name}}, your order {{orderId}} ships to {{address}}.',
        { name: 'Bob', orderId: '12345', address: '123 Main St' }
      );

      expect(result).toBe('Dear Bob, your order 12345 ships to 123 Main St.');
    });

    it('should leave unreplaced variables if value not provided', () => {
      const result = service.renderTemplate(
        'Hello {{name}}, your role is {{role}}.',
        { name: 'Charlie' }
      );

      expect(result).toBe('Hello Charlie, your role is {{role}}.');
    });

    it('should handle nested/complex variable names like {{user.name}}', () => {
      const result = service.renderTemplate(
        'Welcome {{user.name}}, email: {{user.email}}',
        { 'user.name': 'Dana', 'user.email': 'dana@example.com' }
      );

      expect(result).toBe('Welcome Dana, email: dana@example.com');
    });
  });

  // -------------------------------------------------------------------------
  // extractVariables
  // -------------------------------------------------------------------------

  describe('extractVariables', () => {
    it('should extract all {{var}} patterns from content', () => {
      const result = service.extractVariables(
        'Hello {{name}}, your order {{orderId}} is {{status}}.'
      );

      expect(result).toEqual(['name', 'orderId', 'status']);
    });

    it('should return empty array for content with no variables', () => {
      const result = service.extractVariables('Hello, world! No variables here.');

      expect(result).toEqual([]);
    });
  });
});
