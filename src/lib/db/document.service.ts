import { prisma } from './prisma';

interface CreateDocumentInput {
  userId: string;
  title: string;
  content: unknown;
  type: string;
  tags?: string[];
}

interface UpdateDocumentInput {
  title?: string;
  content?: unknown;
  tags?: string[];
}

export class DocumentService {
  async create(input: CreateDocumentInput) {
    return prisma.document.create({
      data: {
        userId: input.userId,
        title: input.title,
        content: input.content,
        type: input.type,
        ...(input.tags ? { tags: input.tags } : {}),
      },
    });
  }

  async list(userId: string, options?: { type?: string }, limit = 50) {
    return prisma.document.findMany({
      where: {
        userId,
        ...(options?.type ? { type: options.type } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });
  }

  async get(id: string) {
    return prisma.document.findUnique({
      where: { id },
    });
  }

  async update(id: string, input: UpdateDocumentInput) {
    const data: Record<string, unknown> = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.content !== undefined) data.content = input.content;
    if (input.tags !== undefined) data.tags = input.tags;

    return prisma.document.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.document.delete({
      where: { id },
    });
  }

  async search(userId: string, keyword: string, limit = 50) {
    return prisma.document.findMany({
      where: {
        userId,
        title: { contains: keyword, mode: 'insensitive' },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });
  }
}
