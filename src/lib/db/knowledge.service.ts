import { prisma } from './prisma';
import { EmbeddingService } from '@/lib/rag/embedding';
import { VectorStore } from '@/lib/rag/vector-store';
import { splitText } from '@/lib/rag/chunker';

export class KnowledgeBaseService {
  private embeddingService: EmbeddingService;
  private vectorStore: VectorStore;

  constructor(embeddingService?: EmbeddingService, vectorStore?: VectorStore) {
    this.embeddingService = embeddingService ?? new EmbeddingService();
    this.vectorStore = vectorStore ?? new VectorStore();
  }

  async createKnowledgeBase(userId: string, name: string, description?: string) {
    return prisma.knowledgeBase.create({
      data: { userId, name, ...(description ? { description } : {}) },
    });
  }

  async listKnowledgeBases(userId: string) {
    return prisma.knowledgeBase.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getKnowledgeBase(id: string) {
    return prisma.knowledgeBase.findUnique({
      where: { id },
      include: { entries: true },
    });
  }

  async deleteKnowledgeBase(id: string) {
    await this.vectorStore.deleteByKnowledgeBase(id);
    return prisma.knowledgeBase.delete({ where: { id } });
  }

  async addEntry(input: {
    knowledgeBaseId: string;
    title: string;
    content: string;
    sourceType: string;
    sourceUrl?: string;
  }): Promise<{ chunksCreated: number }> {
    const chunks = splitText(input.content);
    const embeddings = await this.embeddingService.embedBatch(chunks);

    for (let i = 0; i < chunks.length; i++) {
      await this.vectorStore.upsertEntry({
        id: `${input.knowledgeBaseId}-${Date.now()}-${i}`,
        knowledgeBaseId: input.knowledgeBaseId,
        title: `${input.title} [${i + 1}/${chunks.length}]`,
        content: chunks[i],
        sourceType: input.sourceType,
        sourceUrl: input.sourceUrl,
        embedding: embeddings[i],
      });
    }

    return { chunksCreated: chunks.length };
  }

  async getEntryCount(knowledgeBaseId: string): Promise<number> {
    return prisma.knowledgeEntry.count({ where: { knowledgeBaseId } });
  }
}
