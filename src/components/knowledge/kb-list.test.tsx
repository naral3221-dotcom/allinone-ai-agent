import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KbList } from './kb-list';

const mockKbs = [
  { id: 'kb-1', name: 'Research Notes', description: 'My research notes', createdAt: '2024-01-15T00:00:00Z' },
  { id: 'kb-2', name: 'Code Snippets', description: null, createdAt: '2024-02-20T00:00:00Z' },
];

describe('KbList', () => {
  const defaultProps = {
    knowledgeBases: mockKbs,
    onSelect: vi.fn(),
    onDelete: vi.fn(),
    onCreate: vi.fn(),
  };

  it('renders KB cards when data exists', () => {
    render(<KbList {...defaultProps} />);
    expect(screen.getByTestId('kb-card-kb-1')).toBeDefined();
    expect(screen.getByTestId('kb-card-kb-2')).toBeDefined();
    expect(screen.getByText('Research Notes')).toBeDefined();
    expect(screen.getByText('Code Snippets')).toBeDefined();
  });

  it('shows empty state when no KBs', () => {
    render(<KbList {...defaultProps} knowledgeBases={[]} />);
    expect(screen.getByTestId('kb-empty')).toBeDefined();
    expect(screen.getByText('No knowledge bases yet. Create one to get started.')).toBeDefined();
  });

  it('calls onCreate when button clicked', () => {
    const onCreate = vi.fn();
    render(<KbList {...defaultProps} onCreate={onCreate} />);
    fireEvent.click(screen.getByTestId('create-kb-button'));
    expect(onCreate).toHaveBeenCalledOnce();
  });

  it('calls onSelect when card clicked', () => {
    const onSelect = vi.fn();
    render(<KbList {...defaultProps} onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId('kb-card-kb-1'));
    expect(onSelect).toHaveBeenCalledWith('kb-1');
  });

  it('calls onDelete when delete clicked', () => {
    const onDelete = vi.fn();
    render(<KbList {...defaultProps} onDelete={onDelete} />);
    fireEvent.click(screen.getByTestId('delete-kb-kb-1'));
    expect(onDelete).toHaveBeenCalledWith('kb-1');
  });
});
