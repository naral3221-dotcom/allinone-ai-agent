import { Annotation } from '@langchain/langgraph';
import type { ToolCallRecord } from '@/agents/_shared';

export interface SearchResult {
  title: string;
  url: string;
  content: string;
}

export const ResearchState = Annotation.Root({
  messages: Annotation<Array<{ role: string; content: string }>>({
    reducer: (left, right) => {
      if (Array.isArray(right)) return left.concat(right);
      return left.concat([right]);
    },
    default: () => [],
  }),
  query: Annotation<string>,
  searchQueries: Annotation<string[]>({
    default: () => [],
  }),
  searchResults: Annotation<SearchResult[]>({
    reducer: (left, right) => {
      if (Array.isArray(right)) return left.concat(right);
      return left.concat([right]);
    },
    default: () => [],
  }),
  toolCalls: Annotation<ToolCallRecord[]>({
    reducer: (left, right) => {
      if (Array.isArray(right)) return left.concat(right);
      return left.concat([right]);
    },
    default: () => [],
  }),
  summary: Annotation<string>({
    default: () => '',
  }),
  isComplete: Annotation<boolean>({
    default: () => false,
  }),
});

export type ResearchStateType = typeof ResearchState.State;
