import { Annotation } from '@langchain/langgraph';
import type { ToolCallRecord } from '@/agents/_shared';

export type CodeAction = 'generate' | 'review' | 'debug' | 'explain';

export const CodeState = Annotation.Root({
  messages: Annotation<Array<{ role: string; content: string }>>({
    value: (left, right) => {
      if (Array.isArray(right)) return left.concat(right);
      return left.concat([right]);
    },
    default: () => [],
  }),
  query: Annotation<string>,
  action: Annotation<CodeAction>({
    value: (_, b) => b,
    default: () => 'generate' as CodeAction,
  }),
  language: Annotation<string>({
    value: (_, b) => b,
    default: () => '',
  }),
  codeOutput: Annotation<string>({
    value: (_, b) => b,
    default: () => '',
  }),
  explanation: Annotation<string>({
    value: (_, b) => b,
    default: () => '',
  }),
  toolCalls: Annotation<ToolCallRecord[]>({
    value: (left, right) => {
      if (Array.isArray(right)) return left.concat(right);
      return left.concat([right]);
    },
    default: () => [],
  }),
  isComplete: Annotation<boolean>({
    value: (_, b) => b,
    default: () => false,
  }),
});

export type CodeStateType = typeof CodeState.State;
