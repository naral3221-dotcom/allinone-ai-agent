import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DocumentEditor } from './document-editor';

describe('DocumentEditor', () => {
  const defaultProps = {
    initialTitle: 'My Document',
    initialContent: '<p>Hello world</p>',
    onSave: vi.fn().mockResolvedValue(undefined),
  };

  it('should render title input and content area', () => {
    render(<DocumentEditor {...defaultProps} />);
    expect(screen.getByTestId('document-editor')).toBeDefined();
    expect(screen.getByTestId('doc-title-input')).toBeDefined();
    expect(screen.getByTestId('doc-content-editor')).toBeDefined();
    expect(screen.getByDisplayValue('My Document')).toBeDefined();
  });

  it('should update title input value on change', () => {
    render(<DocumentEditor {...defaultProps} />);
    const input = screen.getByTestId('doc-title-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Updated Title' } });
    expect(input.value).toBe('Updated Title');
  });

  it('should call onSave with title and content when save is clicked', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<DocumentEditor {...defaultProps} onSave={onSave} />);
    fireEvent.click(screen.getByTestId('doc-save-button'));
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'My Document' })
      );
    });
  });

  it('should show saving state while save is in progress', async () => {
    let resolveSave: () => void = () => {};
    const onSave = vi.fn(
      () => new Promise<void>((resolve) => { resolveSave = resolve; })
    );
    render(<DocumentEditor {...defaultProps} onSave={onSave} />);
    fireEvent.click(screen.getByTestId('doc-save-button'));
    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeDefined();
    });
    resolveSave();
    await waitFor(() => {
      expect(screen.getByText('Save')).toBeDefined();
    });
  });
});
