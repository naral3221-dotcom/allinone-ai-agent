import { KnowledgeBaseService } from './knowledge.service';

const globalForKnowledge = globalThis as unknown as {
  knowledgeBaseService: KnowledgeBaseService | undefined;
};

export const knowledgeBaseService =
  globalForKnowledge.knowledgeBaseService ?? new KnowledgeBaseService();

if (process.env.NODE_ENV !== 'production') {
  globalForKnowledge.knowledgeBaseService = knowledgeBaseService;
}
