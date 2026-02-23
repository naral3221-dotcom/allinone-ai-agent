import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WorkspaceError from './error';

describe('WorkspaceError', () => {
  it('renders error message', () => {
    const error = new Error('Workspace error occurred');
    const reset = vi.fn();
    render(<WorkspaceError error={error} reset={reset} />);
    expect(screen.getByTestId('workspace-error-message')).toHaveTextContent('Workspace error occurred');
  });

  it('reset button calls reset', () => {
    const error = new Error('Test error');
    const reset = vi.fn();
    render(<WorkspaceError error={error} reset={reset} />);
    fireEvent.click(screen.getByTestId('workspace-error-reset'));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('go to chat button exists', () => {
    const error = new Error('Test error');
    const reset = vi.fn();
    render(<WorkspaceError error={error} reset={reset} />);
    expect(screen.getByTestId('workspace-error-home')).toBeInTheDocument();
    expect(screen.getByTestId('workspace-error-home')).toHaveTextContent('Go to Chat');
  });
});
