import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageList } from './message-list';
import type { UIMessage } from 'ai';

describe('MessageList', () => {
  it('should show empty state when no messages', () => {
    render(<MessageList messages={[]} />);
    expect(screen.getByText('AI Workspace')).toBeDefined();
    expect(screen.getByText('Start a conversation with your AI assistant.')).toBeDefined();
  });

  it('should render user and assistant messages', () => {
    const messages: UIMessage[] = [
      { id: '1', role: 'user', parts: [{ type: 'text', text: 'Hello' }] },
      { id: '2', role: 'assistant', parts: [{ type: 'text', text: 'Hi there!' }] },
    ];

    render(<MessageList messages={messages} />);
    expect(screen.getByText('Hello')).toBeDefined();
    expect(screen.getByText('Hi there!')).toBeDefined();
  });

  it('should show loading indicator', () => {
    const messages: UIMessage[] = [
      { id: '1', role: 'user', parts: [{ type: 'text', text: 'Hello' }] },
    ];

    render(<MessageList messages={messages} isLoading />);
    expect(screen.getByText('Thinking...')).toBeDefined();
  });

  it('should not show loading when not loading', () => {
    const messages: UIMessage[] = [
      { id: '1', role: 'user', parts: [{ type: 'text', text: 'Hello' }] },
    ];

    render(<MessageList messages={messages} isLoading={false} />);
    expect(screen.queryByText('Thinking...')).toBeNull();
  });
});
