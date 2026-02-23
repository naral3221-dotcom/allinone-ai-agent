import { Annotation } from '@langchain/langgraph';
import type { ToolCallRecord } from '@/agents/_shared';

export type CodeAction = 'generate' | 'review' | 'debug' | 'explain';

export const CodeState = Annotation.Root({
  messages: Annotation<Array<{ role: string; content: string }>>({
    reducer: (left, right) => {
      if (Array.isArray(right)) return left.concat(right);
      return left.concat([right]);
    },
    default: () => [],
  }),
  query: Annotation<string>,
  action: Annotation<CodeAction>({
    default: () => 'generate' as CodeAction,
  }),
  language: Annotation<string>({
    default: () => '',
  }),
  codeOutput: Annotation<string>({
    default: () => '',
  }),
  explanation: Annotation<string>({
    default: () => '',
  }),
  toolCalls: Annotation<ToolCallRecord[]>({
    reducer: (left, right) => {
      if (Array.isArray(right)) return left.concat(right);
      return left.concat([right]);
    },
    default: () => [],
  }),
  isComplete: Annotation<boolean>({
    default: () => false,
  }),
});

export type CodeStateType = typeof CodeState.State;
