import { Annotation } from '@langchain/langgraph';
import type { ToolCallRecord } from '@/agents/_shared';

export interface SearchResult {
  title: string;
  url: string;
  content: string;
}

export const ResearchState = Annotation.Root({
  messages: Annotation<Array<{ role: string; content: string }>>({
    value: (left, right) => {
      if (Array.isArray(right)) return left.concat(right);
      return left.concat([right]);
    },
    default: () => [],
  }),
  query: Annotation<string>,
  searchQueries: Annotation<string[]>({
    value: (_, b) => b,
    default: () => [],
  }),
  searchResults: Annotation<SearchResult[]>({
    value: (left, right) => {
      if (Array.isArray(right)) return left.concat(right);
      return left.concat([right]);
    },
    default: () => [],
  }),
  toolCalls: Annotation<ToolCallRecord[]>({
    value: (left, right) => {
      if (Array.isArray(right)) return left.concat(right);
      return left.concat([right]);
    },
    default: () => [],
  }),
  summary: Annotation<string>({
    value: (_, b) => b,
    default: () => '',
  }),
  isComplete: Annotation<boolean>({
    value: (_, b) => b,
    default: () => false,
  }),
});

export type ResearchStateType = typeof ResearchState.State;
