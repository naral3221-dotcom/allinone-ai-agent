import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResearchForm } from './research-form';

describe('ResearchForm', () => {
  const defaultProps = {
    onSubmit: vi.fn().mockResolvedValue(undefined),
    isRunning: false,
  };

  it('should render textarea and submit button', () => {
    render(<ResearchForm {...defaultProps} />);
    expect(screen.getByTestId('research-query')).toBeDefined();
    expect(screen.getByTestId('research-submit')).toBeDefined();
    expect(screen.getByText('Start Research')).toBeDefined();
  });

  it('should disable submit button when textarea is empty', () => {
    render(<ResearchForm {...defaultProps} />);
    const button = screen.getByTestId('research-submit');
    expect(button.hasAttribute('disabled')).toBe(true);
  });

  it('should disable submit button when isRunning is true', () => {
    render(<ResearchForm {...defaultProps} isRunning={true} />);
    const button = screen.getByTestId('research-submit');
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(screen.getByText('Researching...')).toBeDefined();
  });

  it('should call onSubmit with trimmed query and clear input', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ResearchForm onSubmit={onSubmit} isRunning={false} />);

    const textarea = screen.getByTestId('research-query');
    fireEvent.change(textarea, { target: { value: '  test query  ' } });

    const button = screen.getByTestId('research-submit');
    fireEvent.click(button);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('test query');
    });

    await waitFor(() => {
      expect((textarea as HTMLTextAreaElement).value).toBe('');
    });
  });

  it('should trigger submit on Ctrl+Enter', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ResearchForm onSubmit={onSubmit} isRunning={false} />);

    const textarea = screen.getByTestId('research-query');
    fireEvent.change(textarea, { target: { value: 'ctrl enter test' } });
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('ctrl enter test');
    });
  });
});
