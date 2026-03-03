import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DocumentList } from './document-list';

const mockDocuments = [
  {
    id: 'doc-1',
    title: 'First Document',
    type: 'document',
    tags: ['react', 'ts'],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'doc-2',
    title: 'Second Document',
    type: 'note',
    tags: ['draft'],
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-10T00:00:00Z',
  },
];

describe('DocumentList', () => {
  const defaultProps = {
    documents: mockDocuments,
    onSelect: vi.fn(),
    onDelete: vi.fn(),
    onCreate: vi.fn(),
  };

  it('should render document cards for each document', () => {
    render(<DocumentList {...defaultProps} />);
    expect(screen.getByTestId('document-list')).toBeDefined();
    expect(screen.getByTestId('doc-card-doc-1')).toBeDefined();
    expect(screen.getByTestId('doc-card-doc-2')).toBeDefined();
  });

  it('should show empty state when no documents', () => {
    render(<DocumentList {...defaultProps} documents={[]} />);
    expect(screen.getByTestId('doc-empty')).toBeDefined();
    expect(screen.getByText('아직 문서가 없습니다.')).toBeDefined();
  });

  it('should call onCreate when New Document button is clicked', () => {
    const onCreate = vi.fn();
    render(<DocumentList {...defaultProps} onCreate={onCreate} />);
    fireEvent.click(screen.getByTestId('create-doc-button'));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it('should call onDelete when delete button on a card is clicked', () => {
    const onDelete = vi.fn();
    render(<DocumentList {...defaultProps} onDelete={onDelete} />);
    fireEvent.click(screen.getByTestId('delete-doc-doc-1'));
    expect(onDelete).toHaveBeenCalledWith('doc-1');
  });
});
