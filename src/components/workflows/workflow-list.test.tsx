import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkflowList } from './workflow-list';

const mockWorkflows = [
  {
    id: 'wf-1',
    name: 'Research Pipeline',
    description: 'Multi-step research',
    isActive: true,
    createdAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'wf-2',
    name: 'Code Review',
    description: null,
    isActive: false,
    createdAt: '2024-06-02T00:00:00Z',
  },
];

describe('WorkflowList', () => {
  const defaultProps = {
    workflows: mockWorkflows,
    onSelect: vi.fn(),
    onDelete: vi.fn(),
    onCreate: vi.fn(),
  };

  it('renders workflow cards', () => {
    render(<WorkflowList {...defaultProps} />);
    expect(screen.getByTestId('wf-card-wf-1')).toBeDefined();
    expect(screen.getByTestId('wf-card-wf-2')).toBeDefined();
  });

  it('shows empty state when no workflows', () => {
    render(<WorkflowList {...defaultProps} workflows={[]} />);
    expect(screen.getByTestId('wf-empty')).toBeDefined();
  });

  it('calls onCreate when create button clicked', () => {
    const onCreate = vi.fn();
    render(<WorkflowList {...defaultProps} onCreate={onCreate} />);
    fireEvent.click(screen.getByTestId('create-wf-button'));
    expect(onCreate).toHaveBeenCalled();
  });

  it('calls onSelect when card clicked', () => {
    const onSelect = vi.fn();
    render(<WorkflowList {...defaultProps} onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId('wf-card-wf-1'));
    expect(onSelect).toHaveBeenCalledWith('wf-1');
  });

  it('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    render(<WorkflowList {...defaultProps} onDelete={onDelete} />);
    fireEvent.click(screen.getByTestId('delete-wf-wf-1'));
    expect(onDelete).toHaveBeenCalledWith('wf-1');
  });
});
