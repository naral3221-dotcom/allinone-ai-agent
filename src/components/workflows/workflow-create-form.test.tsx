import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkflowCreateForm } from './workflow-create-form';

describe('WorkflowCreateForm', () => {
  const defaultProps = {
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onCancel: vi.fn(),
  };

  it('renders name and description inputs', () => {
    render(<WorkflowCreateForm {...defaultProps} />);
    expect(screen.getByTestId('wf-name-input')).toBeDefined();
    expect(screen.getByTestId('wf-desc-input')).toBeDefined();
  });

  it('add step adds a step editor', () => {
    render(<WorkflowCreateForm {...defaultProps} />);
    fireEvent.click(screen.getByTestId('add-step-button'));
    expect(screen.getByTestId('step-editor-0')).toBeDefined();
  });

  it('remove step removes a step editor', () => {
    render(<WorkflowCreateForm {...defaultProps} />);
    fireEvent.click(screen.getByTestId('add-step-button'));
    expect(screen.getByTestId('step-editor-0')).toBeDefined();
    fireEvent.click(screen.getByTestId('remove-step-0'));
    expect(screen.queryByTestId('step-editor-0')).toBeNull();
  });

  it('submit is disabled when name is empty or no steps', () => {
    render(<WorkflowCreateForm {...defaultProps} />);
    const submitBtn = screen.getByTestId('wf-create-submit');
    expect(submitBtn).toBeDisabled();

    // Add name but no steps - still disabled
    fireEvent.change(screen.getByTestId('wf-name-input'), {
      target: { value: 'Test' },
    });
    expect(submitBtn).toBeDisabled();

    // Add a step - should be enabled
    fireEvent.click(screen.getByTestId('add-step-button'));
    expect(submitBtn).not.toBeDisabled();
  });

  it('calls onSubmit with correct data', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<WorkflowCreateForm {...defaultProps} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByTestId('wf-name-input'), {
      target: { value: 'My Workflow' },
    });
    fireEvent.change(screen.getByTestId('wf-desc-input'), {
      target: { value: 'A description' },
    });
    fireEvent.click(screen.getByTestId('add-step-button'));
    fireEvent.change(screen.getByTestId('step-agent-0'), {
      target: { value: 'research' },
    });
    fireEvent.change(screen.getByTestId('step-prompt-0'), {
      target: { value: 'Research this topic' },
    });

    fireEvent.click(screen.getByTestId('wf-create-submit'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'My Workflow',
        description: 'A description',
        steps: [
          { order: 1, agentType: 'research', prompt: 'Research this topic' },
        ],
      });
    });
  });
});
