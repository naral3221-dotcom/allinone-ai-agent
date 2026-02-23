import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToolCallCard } from './tool-call-card';

describe('ToolCallCard', () => {
  const successToolCall = {
    id: 'tool-1',
    toolName: 'web_search',
    input: { query: 'latest AI research', maxResults: 5 },
    output: { results: ['Result 1', 'Result 2'] },
    duration: 1234,
    status: 'success' as const,
  };

  const errorToolCall = {
    id: 'tool-2',
    toolName: 'code_execute',
    input: { code: 'print("hello")', language: 'python' },
    output: null,
    duration: 567,
    status: 'error' as const,
    error: 'Execution timeout: process exceeded 30s limit',
  };

  it('should render the tool name', () => {
    render(<ToolCallCard toolCall={successToolCall} />);
    expect(screen.getByText('web_search')).toBeDefined();
  });

  it('should render the duration in human-readable format', () => {
    render(<ToolCallCard toolCall={successToolCall} />);
    // 1234ms should be displayed as "1.2s"
    expect(screen.getByText('1.2s')).toBeDefined();
  });

  it('should render sub-second duration correctly', () => {
    const fastToolCall = {
      ...successToolCall,
      id: 'tool-fast',
      duration: 89,
    };
    render(<ToolCallCard toolCall={fastToolCall} />);
    // 89ms should be displayed as "89ms" or "0.1s"
    const card = screen.getByTestId('tool-call-card');
    // Duration text must be present - either ms or seconds format
    expect(card.textContent).toMatch(/89ms|0\.1s|0\.09s/);
  });

  it('should show success status indicator', () => {
    render(<ToolCallCard toolCall={successToolCall} />);
    const card = screen.getByTestId('tool-call-card');
    // Check for either a data-status attribute or visible "success" text
    const hasStatusAttr = card.getAttribute('data-status') === 'success';
    const hasStatusText = card.textContent?.toLowerCase().includes('success');
    expect(hasStatusAttr || hasStatusText).toBe(true);
  });

  it('should show error status with error message', () => {
    render(<ToolCallCard toolCall={errorToolCall} />);
    const card = screen.getByTestId('tool-call-card');
    // Check for error status indicator
    const hasErrorAttr = card.getAttribute('data-status') === 'error';
    const hasErrorText = card.textContent?.toLowerCase().includes('error');
    expect(hasErrorAttr || hasErrorText).toBe(true);
    // Error message should be visible
    expect(
      screen.getByText('Execution timeout: process exceeded 30s limit')
    ).toBeDefined();
  });

  it('should render JSON input as formatted text', () => {
    render(<ToolCallCard toolCall={successToolCall} />);
    const card = screen.getByTestId('tool-call-card');
    // The input object keys/values should be rendered somewhere in the card
    expect(card.textContent).toContain('query');
    expect(card.textContent).toContain('latest AI research');
    expect(card.textContent).toContain('maxResults');
  });

  it('should not show error message when status is success', () => {
    render(<ToolCallCard toolCall={successToolCall} />);
    expect(
      screen.queryByText('Execution timeout: process exceeded 30s limit')
    ).toBeNull();
  });

  it('should render the error tool name correctly', () => {
    render(<ToolCallCard toolCall={errorToolCall} />);
    expect(screen.getByText('code_execute')).toBeDefined();
  });
});
