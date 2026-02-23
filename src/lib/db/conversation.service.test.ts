import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConversationService } from './conversation.service';

const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      user: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
      conversation: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      message: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      usageLog: {
        create: vi.fn(),
      },
    },
  };
});

vi.mock('./prisma', () => ({
  prisma: mockPrisma,
}));

describe('ConversationService', () => {
  const service = new ConversationService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ensureUser', () => {
    it('should upsert user by clerkId', async () => {
      const user = { id: 'user-1', clerkId: 'clerk-123', email: 'test@test.com' };
      mockPrisma.user.upsert.mockResolvedValue(user);

      const result = await service.ensureUser('clerk-123', 'test@test.com', 'Test');
      expect(result).toEqual(user);
      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: { clerkId: 'clerk-123' },
        update: { email: 'test@test.com', name: 'Test' },
        create: { clerkId: 'clerk-123', email: 'test@test.com', name: 'Test' },
      });
    });
  });

  describe('createConversation', () => {
    it('should create a new conversation', async () => {
      const conv = { id: 'conv-1', userId: 'user-1', title: null };
      mockPrisma.conversation.create.mockResolvedValue(conv);

      const result = await service.createConversation('user-1');
      expect(result).toEqual(conv);
      expect(mockPrisma.conversation.create).toHaveBeenCalledWith({
        data: { userId: 'user-1' },
      });
    });

    it('should create conversation with title', async () => {
      const conv = { id: 'conv-1', userId: 'user-1', title: 'My Chat' };
      mockPrisma.conversation.create.mockResolvedValue(conv);

      const result = await service.createConversation('user-1', 'My Chat');
      expect(result.title).toBe('My Chat');
    });
  });

  describe('listConversations', () => {
    it('should list conversations ordered by updatedAt desc', async () => {
      const convs = [
        { id: 'conv-2', title: 'Second' },
        { id: 'conv-1', title: 'First' },
      ];
      mockPrisma.conversation.findMany.mockResolvedValue(convs);

      const result = await service.listConversations('user-1');
      expect(result).toHaveLength(2);
      expect(mockPrisma.conversation.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', archived: false },
        orderBy: { updatedAt: 'desc' },
        take: 50,
      });
    });
  });

  describe('getConversation', () => {
    it('should get conversation with messages', async () => {
      const conv = {
        id: 'conv-1',
        messages: [{ id: 'msg-1', content: 'hello' }],
      };
      mockPrisma.conversation.findUnique.mockResolvedValue(conv);

      const result = await service.getConversation('conv-1', 'user-1');
      expect(result?.messages).toHaveLength(1);
    });

    it('should return null for non-existent conversation', async () => {
      mockPrisma.conversation.findUnique.mockResolvedValue(null);

      const result = await service.getConversation('missing', 'user-1');
      expect(result).toBeNull();
    });
  });

  describe('deleteConversation', () => {
    it('should delete conversation', async () => {
      mockPrisma.conversation.findUnique.mockResolvedValue({ id: 'conv-1', userId: 'user-1' });
      mockPrisma.conversation.delete.mockResolvedValue({ id: 'conv-1' });

      await service.deleteConversation('conv-1', 'user-1');
      expect(mockPrisma.conversation.delete).toHaveBeenCalledWith({
        where: { id: 'conv-1' },
      });
    });

    it('should throw if conversation does not belong to user', async () => {
      mockPrisma.conversation.findUnique.mockResolvedValue({ id: 'conv-1', userId: 'other-user' });

      await expect(
        service.deleteConversation('conv-1', 'user-1')
      ).rejects.toThrow('Conversation not found');
    });
  });

  describe('addMessage', () => {
    it('should add a message to conversation', async () => {
      const msg = { id: 'msg-1', role: 'user', content: 'hello' };
      mockPrisma.message.create.mockResolvedValue(msg);

      const result = await service.addMessage('conv-1', {
        role: 'user',
        content: 'hello',
      });
      expect(result).toEqual(msg);
    });

    it('should add assistant message with model info', async () => {
      const msg = {
        id: 'msg-2',
        role: 'assistant',
        content: 'Hi!',
        model: 'claude-sonnet',
      };
      mockPrisma.message.create.mockResolvedValue(msg);

      const result = await service.addMessage('conv-1', {
        role: 'assistant',
        content: 'Hi!',
        model: 'claude-sonnet',
      });
      expect(result.model).toBe('claude-sonnet');
    });
  });

  describe('getMessages', () => {
    it('should get messages ordered by createdAt', async () => {
      const messages = [
        { id: 'msg-1', content: 'hello' },
        { id: 'msg-2', content: 'hi' },
      ];
      mockPrisma.message.findMany.mockResolvedValue(messages);

      const result = await service.getMessages('conv-1');
      expect(result).toHaveLength(2);
      expect(mockPrisma.message.findMany).toHaveBeenCalledWith({
        where: { conversationId: 'conv-1' },
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('logUsage', () => {
    it('should create a usage log entry', async () => {
      mockPrisma.usageLog.create.mockResolvedValue({ id: 'log-1' });

      await service.logUsage({
        userId: 'user-1',
        model: 'claude-sonnet',
        inputTokens: 100,
        outputTokens: 200,
        cost: 0.006,
      });

      expect(mockPrisma.usageLog.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          model: 'claude-sonnet',
          inputTokens: 100,
          outputTokens: 200,
          cost: 0.006,
        },
      });
    });
  });
});
