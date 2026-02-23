import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KbCard } from './kb-card';

const mockKb = {
  id: 'kb-1',
  name: 'Research Notes',
  description: 'A collection of research notes',
  createdAt: '2024-01-15T00:00:00Z',
};

describe('KbCard', () => {
  const defaultProps = {
    kb: mockKb,
    onSelect: vi.fn(),
    onDelete: vi.fn(),
  };

  it('renders name and description', () => {
    render(<KbCard {...defaultProps} />);
    expect(screen.getByText('Research Notes')).toBeDefined();
    expect(screen.getByText('A collection of research notes')).toBeDefined();
  });

  it('renders creation date', () => {
    render(<KbCard {...defaultProps} />);
    const dateStr = new Date('2024-01-15T00:00:00Z').toLocaleDateString();
    expect(screen.getByText(dateStr)).toBeDefined();
  });

  it('click calls onSelect', () => {
    const onSelect = vi.fn();
    render(<KbCard {...defaultProps} onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId('kb-card-kb-1'));
    expect(onSelect).toHaveBeenCalledWith('kb-1');
  });

  it('delete button calls onDelete and stops propagation', () => {
    const onSelect = vi.fn();
    const onDelete = vi.fn();
    render(<KbCard {...defaultProps} onSelect={onSelect} onDelete={onDelete} />);
    fireEvent.click(screen.getByTestId('delete-kb-kb-1'));
    expect(onDelete).toHaveBeenCalledWith('kb-1');
    expect(onSelect).not.toHaveBeenCalled();
  });
});
