export type AgentType = 'orchestrator' | 'research' | 'code' | 'data' | 'content';

export type AgentRunStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface AgentRunInput {
  query: string;
  conversationId?: string;
  context?: string[];
}

export interface AgentRunResult {
  output: string;
  steps: AgentStep[];
  toolCalls: ToolCallRecord[];
  model: string;
  duration: number;
}

export interface AgentStep {
  id: string;
  agentType: AgentType;
  action: string;
  input: string;
  output: string;
  timestamp: number;
}

export interface ToolCallRecord {
  id: string;
  toolName: string;
  input: Record<string, unknown>;
  output: unknown;
  duration: number;
  status: 'success' | 'error';
  error?: string;
}

export interface AgentGraphState {
  messages: Array<{ role: string; content: string }>;
  query: string;
  agentType: AgentType;
  steps: AgentStep[];
  toolCalls: ToolCallRecord[];
  output: string;
  isComplete: boolean;
  error?: string;
}
