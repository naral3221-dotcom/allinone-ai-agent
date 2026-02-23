export interface Conversation {
  id: string;
  title: string | null;
  tags: string[];
  pinned: boolean;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  model?: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolCallResult[];
  metadata?: MessageMetadata;
  createdAt: Date;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolCallResult {
  toolCallId: string;
  result: unknown;
}

export interface MessageMetadata {
  inputTokens?: number;
  outputTokens?: number;
  cost?: number;
  duration?: number;
  model?: string;
}
