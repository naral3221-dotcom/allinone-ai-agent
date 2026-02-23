import { prisma } from './prisma';

export class PromptTemplateService {
  async create(input: {
    userId: string;
    name: string;
    content: string;
    description?: string;
    category?: string;
    isPublic?: boolean;
  }) {
    const variables = this.extractVariables(input.content);
    return prisma.promptTemplate.create({
      data: {
        ...input,
        variables,
      },
    });
  }

  async list(userId: string, options?: { category?: string }) {
    return prisma.promptTemplate.findMany({
      where: {
        OR: [
          { userId },
          { isPublic: true },
        ],
        ...(options?.category ? { category: options.category } : {}),
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async get(id: string) {
    return prisma.promptTemplate.findUnique({ where: { id } });
  }

  async update(
    id: string,
    input: {
      name?: string;
      content?: string;
      description?: string;
      category?: string;
      isPublic?: boolean;
    }
  ) {
    const data: Record<string, unknown> = { ...input };
    if (input.content) {
      data.variables = this.extractVariables(input.content);
    }
    return prisma.promptTemplate.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.promptTemplate.delete({ where: { id } });
  }

  renderTemplate(content: string, variables: Record<string, string>): string {
    return content.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmedKey = key.trim();
      return variables[trimmedKey] ?? match;
    });
  }

  extractVariables(content: string): string[] {
    const matches = content.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];
    return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '').trim()))];
  }
}
