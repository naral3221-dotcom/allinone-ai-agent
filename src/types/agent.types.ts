export type AgentType = 'orchestrator' | 'research' | 'code' | 'data' | 'content';

export interface AgentConfig {
  name: string;
  type: AgentType;
  model: string;
  systemPrompt: string;
  tools: AgentTool[];
  maxIterations: number;
}

export interface AgentTool {
  name: string;
  description: string;
  execute: (input: unknown) => Promise<unknown>;
}

export interface AgentState {
  messages: AgentMessage[];
  currentAgent: AgentType;
  toolResults: ToolResult[];
  isComplete: boolean;
}

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  agentType?: AgentType;
  model?: string;
  timestamp: Date;
}

export interface ToolResult {
  toolName: string;
  input: unknown;
  output: unknown;
  duration: number;
}
