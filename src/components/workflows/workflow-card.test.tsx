import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkflowCard } from './workflow-card';

const mockWorkflow = {
  id: 'wf-1',
  name: 'Data Pipeline',
  description: 'Automated data processing pipeline',
  isActive: true,
  createdAt: '2024-06-15T00:00:00Z',
};

describe('WorkflowCard', () => {
  const defaultProps = {
    workflow: mockWorkflow,
    onSelect: vi.fn(),
    onDelete: vi.fn(),
  };

  it('renders name, description, and status', () => {
    render(<WorkflowCard {...defaultProps} />);
    expect(screen.getByText('Data Pipeline')).toBeDefined();
    expect(screen.getByText('Automated data processing pipeline')).toBeDefined();
    expect(screen.getByText('Active')).toBeDefined();
  });

  it('click calls onSelect', () => {
    const onSelect = vi.fn();
    render(<WorkflowCard {...defaultProps} onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId('wf-card-wf-1'));
    expect(onSelect).toHaveBeenCalledWith('wf-1');
  });

  it('delete button calls onDelete with stopPropagation', () => {
    const onSelect = vi.fn();
    const onDelete = vi.fn();
    render(
      <WorkflowCard {...defaultProps} onSelect={onSelect} onDelete={onDelete} />
    );
    fireEvent.click(screen.getByTestId('delete-wf-wf-1'));
    expect(onDelete).toHaveBeenCalledWith('wf-1');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('shows active badge for active workflow and inactive badge for inactive', () => {
    const { rerender } = render(<WorkflowCard {...defaultProps} />);
    expect(screen.getByText('Active')).toBeDefined();

    rerender(
      <WorkflowCard
        {...defaultProps}
        workflow={{ ...mockWorkflow, isActive: false }}
      />
    );
    expect(screen.getByText('Inactive')).toBeDefined();
  });
});
