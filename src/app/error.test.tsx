import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GlobalError from './error';

describe('GlobalError', () => {
  it('renders error message', () => {
    const error = new Error('Test error message');
    const reset = vi.fn();
    render(<GlobalError error={error} reset={reset} />);
    expect(screen.getByTestId('error-message')).toHaveTextContent('Test error message');
  });

  it('renders default message when error.message is empty', () => {
    const error = new Error('');
    const reset = vi.fn();
    render(<GlobalError error={error} reset={reset} />);
    expect(screen.getByTestId('error-message')).toHaveTextContent('An unexpected error occurred');
  });

  it('reset button calls reset function', () => {
    const error = new Error('Test error');
    const reset = vi.fn();
    render(<GlobalError error={error} reset={reset} />);
    fireEvent.click(screen.getByTestId('error-reset'));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
