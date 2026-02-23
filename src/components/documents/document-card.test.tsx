import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DocumentCard } from './document-card';

const mockDocument = {
  id: 'doc-1',
  title: 'Test Document',
  type: 'document',
  tags: ['react', 'typescript'],
  updatedAt: '2026-01-15T00:00:00Z',
};

describe('DocumentCard', () => {
  const defaultProps = {
    document: mockDocument,
    onSelect: vi.fn(),
    onDelete: vi.fn(),
  };

  it('should render title, type, tags, and date', () => {
    render(<DocumentCard {...defaultProps} />);
    expect(screen.getByText('Test Document')).toBeDefined();
    expect(screen.getByText('document')).toBeDefined();
    expect(screen.getByText('#react')).toBeDefined();
    expect(screen.getByText('#typescript')).toBeDefined();
    expect(
      screen.getByText(new Date('2026-01-15T00:00:00Z').toLocaleDateString())
    ).toBeDefined();
  });

  it('should call onSelect with document id when card is clicked', () => {
    const onSelect = vi.fn();
    render(<DocumentCard {...defaultProps} onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId('doc-card-doc-1'));
    expect(onSelect).toHaveBeenCalledWith('doc-1');
  });

  it('should call onDelete and stop propagation when delete button is clicked', () => {
    const onSelect = vi.fn();
    const onDelete = vi.fn();
    render(
      <DocumentCard
        {...defaultProps}
        onSelect={onSelect}
        onDelete={onDelete}
      />
    );
    fireEvent.click(screen.getByTestId('delete-doc-doc-1'));
    expect(onDelete).toHaveBeenCalledWith('doc-1');
    // onSelect should not be called because stopPropagation was used
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('should render multiple tags correctly', () => {
    const docWithManyTags = {
      ...mockDocument,
      tags: ['react', 'typescript', 'nextjs'],
    };
    render(<DocumentCard {...defaultProps} document={docWithManyTags} />);
    expect(screen.getByText('#react')).toBeDefined();
    expect(screen.getByText('#typescript')).toBeDefined();
    expect(screen.getByText('#nextjs')).toBeDefined();
  });
});
