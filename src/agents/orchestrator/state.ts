import { Annotation } from '@langchain/langgraph';
import type { AgentType, AgentStep, ToolCallRecord } from '@/agents/_shared';

export const OrchestratorState = Annotation.Root({
  messages: Annotation<Array<{ role: string; content: string }>>({
    reducer: (left, right) => {
      if (Array.isArray(right)) return left.concat(right);
      return left.concat([right]);
    },
    default: () => [],
  }),
  query: Annotation<string>,
  selectedAgent: Annotation<AgentType>({
    default: () => 'orchestrator' as AgentType,
  }),
  steps: Annotation<AgentStep[]>({
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
  output: Annotation<string>({
    default: () => '',
  }),
  isComplete: Annotation<boolean>({
    default: () => false,
  }),
  error: Annotation<string | undefined>({
    default: () => undefined,
  }),
});

export type OrchestratorStateType = typeof OrchestratorState.State;
