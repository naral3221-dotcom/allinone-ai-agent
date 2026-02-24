import { prisma } from './prisma';
import type { Prisma } from '@prisma/client';

export class WorkflowService {
  async create(input: {
    userId: string;
    name: string;
    description?: string;
    steps: Array<{
      order: number;
      agentType: string;
      prompt: string;
      config?: Prisma.InputJsonValue;
    }>;
  }) {
    return prisma.workflow.create({
      data: {
        userId: input.userId,
        name: input.name,
        ...(input.description !== undefined ? { description: input.description } : {}),
        steps: {
          create: input.steps,
        },
      },
      include: { steps: { orderBy: { order: 'asc' } } },
    });
  }

  async list(userId: string) {
    return prisma.workflow.findMany({
      where: { userId },
      include: { steps: { orderBy: { order: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async get(id: string) {
    return prisma.workflow.findUnique({
      where: { id },
      include: { steps: { orderBy: { order: 'asc' } } },
    });
  }

  async update(
    id: string,
    input: {
      name?: string;
      description?: string;
      isActive?: boolean;
    }
  ) {
    return prisma.workflow.update({
      where: { id },
      data: input,
      include: { steps: { orderBy: { order: 'asc' } } },
    });
  }

  async delete(id: string) {
    return prisma.workflow.delete({ where: { id } });
  }

  async addStep(
    workflowId: string,
    input: {
      order: number;
      agentType: string;
      prompt: string;
      config?: Prisma.InputJsonValue;
    }
  ) {
    return prisma.workflowStep.create({
      data: {
        workflowId,
        order: input.order,
        agentType: input.agentType,
        prompt: input.prompt,
        ...(input.config !== undefined ? { config: input.config } : {}),
      },
    });
  }

  async removeStep(stepId: string) {
    return prisma.workflowStep.delete({ where: { id: stepId } });
  }
}
