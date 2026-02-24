import { prisma } from './prisma';

interface AddMessageInput {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  model?: string;
  toolCalls?: unknown;
  toolResults?: unknown;
  metadata?: unknown;
}

interface LogUsageInput {
  userId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  agentType?: string;
}

export class ConversationService {
  async ensureUser(email: string, name?: string) {
    return prisma.user.upsert({
      where: { email },
      update: { name },
      create: { email, name },
    });
  }

  async createConversation(userId: string, title?: string) {
    return prisma.conversation.create({
      data: { userId, ...(title ? { title } : {}) },
    });
  }

  async listConversations(userId: string, limit = 50) {
    return prisma.conversation.findMany({
      where: { userId, archived: false },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });
  }

  async getConversation(conversationId: string, userId: string) {
    return prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
  }

  async updateConversationTitle(conversationId: string, title: string) {
    return prisma.conversation.update({
      where: { id: conversationId },
      data: { title },
    });
  }

  async deleteConversation(conversationId: string, userId: string) {
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conv || conv.userId !== userId) {
      throw new Error('Conversation not found');
    }

    return prisma.conversation.delete({
      where: { id: conversationId },
    });
  }

  async addMessage(conversationId: string, input: AddMessageInput) {
    return prisma.message.create({
      data: {
        conversationId,
        role: input.role,
        content: input.content,
        model: input.model,
        toolCalls: input.toolCalls ?? undefined,
        toolResults: input.toolResults ?? undefined,
        metadata: input.metadata ?? undefined,
      },
    });
  }

  async getMessages(conversationId: string) {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async logUsage(input: LogUsageInput) {
    return prisma.usageLog.create({
      data: {
        userId: input.userId,
        model: input.model,
        inputTokens: input.inputTokens,
        outputTokens: input.outputTokens,
        cost: input.cost,
        ...(input.agentType ? { agentType: input.agentType } : {}),
      },
    });
  }
}
