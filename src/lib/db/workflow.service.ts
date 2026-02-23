import { prisma } from './prisma';

export class WorkflowService {
  async create(input: {
    userId: string;
    name: string;
    description?: string;
    steps: Array<{
      order: number;
      agentType: string;
      prompt: string;
      config?: Record<string, unknown>;
    }>;
  }) {
    const data: Record<string, unknown> = {
      userId: input.userId,
      name: input.name,
      steps: {
        create: input.steps,
      },
    };

    if (input.description !== undefined) {
      data.description = input.description;
    }

    return prisma.workflow.create({
      data,
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
      config?: Record<string, unknown>;
    }
  ) {
    return prisma.workflowStep.create({
      data: {
        workflowId,
        ...input,
      },
    });
  }

  async removeStep(stepId: string) {
    return prisma.workflowStep.delete({ where: { id: stepId } });
  }
}
