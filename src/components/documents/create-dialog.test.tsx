import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateDialog } from './create-dialog';

describe('CreateDialog', () => {
  const defaultProps = {
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onCancel: vi.fn(),
  };

  it('should render title input and type select', () => {
    render(<CreateDialog {...defaultProps} />);
    expect(screen.getByTestId('create-doc-dialog')).toBeDefined();
    expect(screen.getByTestId('doc-title-create')).toBeDefined();
    expect(screen.getByTestId('doc-type-select')).toBeDefined();
  });

  it('should disable submit button when title is empty', () => {
    render(<CreateDialog {...defaultProps} />);
    const submitBtn = screen.getByTestId(
      'doc-create-submit'
    ) as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);
  });

  it('should call onSubmit with title and type when submitted', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CreateDialog {...defaultProps} onSubmit={onSubmit} />);
    const titleInput = screen.getByTestId('doc-title-create');
    fireEvent.change(titleInput, { target: { value: 'New Doc' } });

    const typeSelect = screen.getByTestId('doc-type-select');
    fireEvent.change(typeSelect, { target: { value: 'note' } });

    fireEvent.click(screen.getByTestId('doc-create-submit'));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ title: 'New Doc', type: 'note' });
    });
  });

  it('should call onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<CreateDialog {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('취소'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
