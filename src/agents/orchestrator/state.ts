import { Annotation } from '@langchain/langgraph';
import type { AgentType, AgentStep, ToolCallRecord } from '@/agents/_shared';

export const OrchestratorState = Annotation.Root({
  messages: Annotation<Array<{ role: string; content: string }>>({
    value: (left, right) => {
      if (Array.isArray(right)) return left.concat(right);
      return left.concat([right]);
    },
    default: () => [],
  }),
  query: Annotation<string>,
  selectedAgent: Annotation<AgentType>({
    value: (_, b) => b,
    default: () => 'orchestrator' as AgentType,
  }),
  steps: Annotation<AgentStep[]>({
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
  output: Annotation<string>({
    value: (_, b) => b,
    default: () => '',
  }),
  isComplete: Annotation<boolean>({
    value: (_, b) => b,
    default: () => false,
  }),
  error: Annotation<string | undefined>({
    value: (_, b) => b,
    default: () => undefined,
  }),
});

export type OrchestratorStateType = typeof OrchestratorState.State;
