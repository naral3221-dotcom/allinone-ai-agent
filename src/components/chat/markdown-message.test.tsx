import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownMessage } from './markdown-message';

describe('MarkdownMessage', () => {
  it('should render user message as plain text', () => {
    render(<MarkdownMessage content="Hello world" role="user" />);
    expect(screen.getByText('Hello world')).toBeDefined();
  });

  it('should render assistant message with markdown', () => {
    render(
      <MarkdownMessage content="**bold text**" role="assistant" />
    );
    const bold = screen.getByText('bold text');
    expect(bold.tagName).toBe('STRONG');
  });

  it('should render inline code', () => {
    render(
      <MarkdownMessage content="Use `console.log`" role="assistant" />
    );
    const code = screen.getByText('console.log');
    expect(code.tagName).toBe('CODE');
  });

  it('should render code blocks in pre element', () => {
    const content = '```js\nconst x = 1;\n```';
    const { container } = render(
      <MarkdownMessage content={content} role="assistant" />
    );
    const pre = container.querySelector('pre');
    expect(pre).not.toBeNull();
    const code = pre?.querySelector('code');
    expect(code).not.toBeNull();
    expect(code?.textContent).toContain('const');
    expect(code?.textContent).toContain('x = 1');
  });
});
