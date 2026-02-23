import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

export class VectorStore {
  async upsertEntry(input: {
    id: string;
    knowledgeBaseId: string;
    title: string;
    content: string;
    sourceType: string;
    sourceUrl?: string;
    embedding: number[];
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const embeddingStr = `[${input.embedding.join(',')}]`;
    const metadataValue = input.metadata
      ? JSON.stringify(input.metadata)
      : null;

    await prisma.$executeRaw`
      INSERT INTO "KnowledgeEntry" (id, "knowledgeBaseId", title, content, "sourceType", "sourceUrl", embedding, metadata, "createdAt")
      VALUES (${input.id}, ${input.knowledgeBaseId}, ${input.title}, ${input.content}, ${input.sourceType}, ${input.sourceUrl ?? null}, ${embeddingStr}::vector, ${metadataValue}::jsonb, NOW())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        embedding = EXCLUDED.embedding,
        metadata = EXCLUDED.metadata
    `;
  }

  async similaritySearch(input: {
    embedding: number[];
    knowledgeBaseId: string;
    topK?: number;
  }): Promise<
    Array<{ id: string; title: string; content: string; similarity: number }>
  > {
    const embeddingStr = `[${input.embedding.join(',')}]`;
    const topK = input.topK ?? 5;

    return prisma.$queryRaw`
      SELECT id, title, content, 1 - (embedding <=> ${embeddingStr}::vector) as similarity
      FROM "KnowledgeEntry"
      WHERE "knowledgeBaseId" = ${input.knowledgeBaseId}
      ORDER BY embedding <=> ${embeddingStr}::vector
      LIMIT ${topK}
    `;
  }

  async deleteByKnowledgeBase(knowledgeBaseId: string): Promise<void> {
    await prisma.knowledgeEntry.deleteMany({
      where: { knowledgeBaseId },
    });
  }

  async getEntriesByKnowledgeBase(
    knowledgeBaseId: string
  ): Promise<
    Array<{ id: string; title: string; content: string; sourceType: string }>
  > {
    return prisma.knowledgeEntry.findMany({
      where: { knowledgeBaseId },
      select: { id: true, title: true, content: true, sourceType: true },
    });
  }
}
