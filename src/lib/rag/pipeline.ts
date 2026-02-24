import { generateText } from 'ai';
import { models } from '@/lib/ai/providers';

import { EmbeddingService } from './embedding';
import { VectorStore } from './vector-store';

export interface RetrievedContext {
  id: string;
  title: string;
  content: string;
  similarity: number;
}

export class RAGPipeline {
  private embeddingService: EmbeddingService;
  private vectorStore: VectorStore;

  constructor(embeddingService?: EmbeddingService, vectorStore?: VectorStore) {
    this.embeddingService = embeddingService ?? new EmbeddingService();
    this.vectorStore = vectorStore ?? new VectorStore();
  }

  async retrieveContext(input: {
    query: string;
    knowledgeBaseId: string;
    topK?: number;
  }): Promise<RetrievedContext[]> {
    const embedding = await this.embeddingService.embedText(input.query);
    return this.vectorStore.similaritySearch({
      embedding,
      knowledgeBaseId: input.knowledgeBaseId,
      topK: input.topK,
    });
  }

  async generateWithContext(input: {
    query: string;
    contexts: RetrievedContext[];
    modelId?: string;
  }): Promise<{ answer: string; sources: Array<{ title: string; similarity: number }> }> {
    const modelId = (input.modelId ?? 'claude-sonnet') as keyof typeof models;
    const model = models[modelId];

    let system = 'You are a helpful assistant. Answer the user\'s question based on the provided context. If the context doesn\'t contain relevant information, say so.\n\n';

    if (input.contexts.length > 0) {
      system += 'Context:\n';
      for (const ctx of input.contexts) {
        system += `---\n${ctx.content}\n`;
      }
    }

    const { text } = await generateText({
      model,
      system,
      prompt: input.query,
      maxOutputTokens: 4096,
    });

    return {
      answer: text,
      sources: input.contexts.map(c => ({ title: c.title, similarity: c.similarity })),
    };
  }

  async query(input: {
    query: string;
    knowledgeBaseId: string;
    topK?: number;
    modelId?: string;
  }): Promise<{ answer: string; sources: Array<{ title: string; similarity: number }>; contexts: RetrievedContext[] }> {
    const contexts = await this.retrieveContext({
      query: input.query,
      knowledgeBaseId: input.knowledgeBaseId,
      topK: input.topK,
    });

    const { answer, sources } = await this.generateWithContext({
      query: input.query,
      contexts,
      modelId: input.modelId,
    });

    return { answer, sources, contexts };
  }
}
