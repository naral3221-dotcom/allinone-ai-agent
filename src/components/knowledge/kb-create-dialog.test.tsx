import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { KbCreateDialog } from './kb-create-dialog';

describe('KbCreateDialog', () => {
  const defaultProps = {
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onCancel: vi.fn(),
  };

  it('renders input fields', () => {
    render(<KbCreateDialog {...defaultProps} />);
    expect(screen.getByTestId('kb-name-input')).toBeDefined();
    expect(screen.getByTestId('kb-desc-input')).toBeDefined();
    expect(screen.getByTestId('kb-create-submit')).toBeDefined();
  });

  it('submit disabled when name empty', () => {
    render(<KbCreateDialog {...defaultProps} />);
    const submitButton = screen.getByTestId('kb-create-submit');
    expect(submitButton.hasAttribute('disabled')).toBe(true);
  });

  it('calls onSubmit with name and description', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<KbCreateDialog {...defaultProps} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByTestId('kb-name-input'), {
      target: { value: 'My KB' },
    });
    fireEvent.change(screen.getByTestId('kb-desc-input'), {
      target: { value: 'A test description' },
    });
    fireEvent.click(screen.getByTestId('kb-create-submit'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('My KB', 'A test description');
    });
  });

  it('cancel calls onCancel', () => {
    const onCancel = vi.fn();
    render(<KbCreateDialog {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
