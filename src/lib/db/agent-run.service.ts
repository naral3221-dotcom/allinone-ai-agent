import { prisma } from './prisma';
import type { Prisma } from '@prisma/client';
import type { AgentRunResult } from '@/agents/_shared';

interface CreateRunInput {
  userId: string;
  agentType: string;
  input: string;
  conversationId?: string;
}

interface ListRunsOptions {
  limit?: number;
  offset?: number;
  agentType?: string;
}

export class AgentRunService {
  async createRun(input: CreateRunInput) {
    return prisma.agentRun.create({
      data: {
        userId: input.userId,
        agentType: input.agentType,
        input: input.input,
        status: 'pending',
        ...(input.conversationId ? { conversationId: input.conversationId } : {}),
      },
    });
  }

  async updateRunStatus(runId: string, status: string, output?: string) {
    return prisma.agentRun.update({
      where: { id: runId },
      data: {
        status: status as 'pending' | 'running' | 'completed' | 'failed',
        ...(output !== undefined ? { output } : {}),
      },
    });
  }

  async completeRun(runId: string, result: AgentRunResult) {
    return prisma.agentRun.update({
      where: { id: runId },
      data: {
        status: 'completed',
        output: result.output,
        steps: result.steps as unknown as Prisma.InputJsonValue,
        toolCalls: result.toolCalls as unknown as Prisma.InputJsonValue,
        model: result.model,
        duration: result.duration,
      },
    });
  }

  async failRun(runId: string, error: string) {
    return prisma.agentRun.update({
      where: { id: runId },
      data: {
        status: 'failed',
        error,
      },
    });
  }

  async getRun(runId: string) {
    return prisma.agentRun.findUnique({
      where: { id: runId },
    });
  }

  async listRuns(userId: string, options: ListRunsOptions = {}) {
    const { limit = 20, offset = 0, agentType } = options;

    return prisma.agentRun.findMany({
      where: {
        userId,
        ...(agentType ? { agentType } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async listRunsByConversation(conversationId: string) {
    return prisma.agentRun.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
