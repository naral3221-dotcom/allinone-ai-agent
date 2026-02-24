import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';

export class EmbeddingService {
  private model;
  private dimension: number;

  constructor(options?: { model?: string; dimension?: number }) {
    this.dimension = options?.dimension ?? 1536;
    this.model = openai.embedding(options?.model ?? 'text-embedding-3-small');
  }

  async embedText(text: string): Promise<number[]> {
    const { embedding } = await embed({ model: this.model, value: text });
    return embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    const { embeddings } = await embedMany({ model: this.model, values: texts });
    return embeddings;
  }

  getEmbeddingDimension(): number {
    return this.dimension;
  }
}
