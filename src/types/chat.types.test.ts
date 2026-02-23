import { describe, it, expect } from 'vitest';
import type { Conversation, ChatMessage } from './chat.types';

describe('Chat Types', () => {
  it('should create a valid Conversation', () => {
    const conversation: Conversation = {
      id: 'conv-1',
      title: 'Test Conversation',
      tags: ['test'],
      pinned: false,
      archived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(conversation.id).toBe('conv-1');
    expect(conversation.pinned).toBe(false);
  });

  it('should create a valid ChatMessage with tool calls', () => {
    const message: ChatMessage = {
      id: 'msg-1',
      role: 'assistant',
      content: 'Here is the result.',
      model: 'claude-sonnet-4-6',
      toolCalls: [
        { id: 'tc-1', name: 'web_search', arguments: { query: 'test' } },
      ],
      metadata: {
        inputTokens: 100,
        outputTokens: 50,
        cost: 0.001,
        duration: 500,
      },
      createdAt: new Date(),
    };

    expect(message.role).toBe('assistant');
    expect(message.toolCalls).toHaveLength(1);
    expect(message.metadata?.inputTokens).toBe(100);
  });
});
