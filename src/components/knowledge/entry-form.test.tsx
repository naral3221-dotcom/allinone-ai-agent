import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EntryForm } from './entry-form';

describe('EntryForm', () => {
  const defaultProps = {
    onSubmit: vi.fn().mockResolvedValue(undefined),
  };

  it('renders input fields', () => {
    render(<EntryForm {...defaultProps} />);
    expect(screen.getByTestId('entry-title')).toBeDefined();
    expect(screen.getByTestId('entry-content')).toBeDefined();
    expect(screen.getByTestId('entry-source-type')).toBeDefined();
    expect(screen.getByTestId('entry-submit')).toBeDefined();
  });

  it('submit disabled when fields are empty', () => {
    render(<EntryForm {...defaultProps} />);
    const submitButton = screen.getByTestId('entry-submit');
    expect(submitButton.hasAttribute('disabled')).toBe(true);
  });

  it('calls onSubmit and clears fields', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<EntryForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByTestId('entry-title'), {
      target: { value: 'Test Title' },
    });
    fireEvent.change(screen.getByTestId('entry-content'), {
      target: { value: 'Some content here' },
    });
    fireEvent.click(screen.getByTestId('entry-submit'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Test Title',
        content: 'Some content here',
        sourceType: 'manual',
      });
    });

    await waitFor(() => {
      expect((screen.getByTestId('entry-title') as HTMLInputElement).value).toBe('');
      expect((screen.getByTestId('entry-content') as HTMLTextAreaElement).value).toBe('');
    });
  });

  it('source type select works', () => {
    render(<EntryForm {...defaultProps} />);
    const select = screen.getByTestId('entry-source-type') as HTMLSelectElement;
    expect(select.value).toBe('manual');

    fireEvent.change(select, { target: { value: 'web' } });
    expect(select.value).toBe('web');

    fireEvent.change(select, { target: { value: 'file' } });
    expect(select.value).toBe('file');
  });
});
