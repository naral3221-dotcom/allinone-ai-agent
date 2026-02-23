import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageList } from './message-list';
import type { Message } from 'ai';

describe('MessageList', () => {
  it('should show empty state when no messages', () => {
    render(<MessageList messages={[]} />);
    expect(screen.getByText('AI Workspace')).toBeDefined();
    expect(screen.getByText('Start a conversation with your AI assistant.')).toBeDefined();
  });

  it('should render user and assistant messages', () => {
    const messages: Message[] = [
      { id: '1', role: 'user', content: 'Hello' },
      { id: '2', role: 'assistant', content: 'Hi there!' },
    ];

    render(<MessageList messages={messages} />);
    expect(screen.getByText('Hello')).toBeDefined();
    expect(screen.getByText('Hi there!')).toBeDefined();
  });

  it('should show loading indicator', () => {
    const messages: Message[] = [
      { id: '1', role: 'user', content: 'Hello' },
    ];

    render(<MessageList messages={messages} isLoading />);
    expect(screen.getByText('Thinking...')).toBeDefined();
  });

  it('should not show loading when not loading', () => {
    const messages: Message[] = [
      { id: '1', role: 'user', content: 'Hello' },
    ];

    render(<MessageList messages={messages} isLoading={false} />);
    expect(screen.queryByText('Thinking...')).toBeNull();
  });
});
