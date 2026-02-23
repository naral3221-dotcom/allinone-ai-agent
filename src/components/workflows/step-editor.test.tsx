import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepEditor } from './step-editor';

describe('StepEditor', () => {
  const defaultProps = {
    index: 0,
    step: { agentType: 'research', prompt: 'Analyze this data' },
    onChange: vi.fn(),
    onRemove: vi.fn(),
  };

  it('renders agent type select and prompt textarea', () => {
    render(<StepEditor {...defaultProps} />);
    const select = screen.getByTestId('step-agent-0') as HTMLSelectElement;
    const textarea = screen.getByTestId('step-prompt-0') as HTMLTextAreaElement;
    expect(select.value).toBe('research');
    expect(textarea.value).toBe('Analyze this data');
  });

  it('changing agent type calls onChange', () => {
    const onChange = vi.fn();
    render(<StepEditor {...defaultProps} onChange={onChange} />);
    fireEvent.change(screen.getByTestId('step-agent-0'), {
      target: { value: 'code' },
    });
    expect(onChange).toHaveBeenCalledWith({
      agentType: 'code',
      prompt: 'Analyze this data',
    });
  });

  it('changing prompt calls onChange', () => {
    const onChange = vi.fn();
    render(<StepEditor {...defaultProps} onChange={onChange} />);
    fireEvent.change(screen.getByTestId('step-prompt-0'), {
      target: { value: 'New prompt' },
    });
    expect(onChange).toHaveBeenCalledWith({
      agentType: 'research',
      prompt: 'New prompt',
    });
  });

  it('remove button calls onRemove', () => {
    const onRemove = vi.fn();
    render(<StepEditor {...defaultProps} onRemove={onRemove} />);
    fireEvent.click(screen.getByTestId('remove-step-0'));
    expect(onRemove).toHaveBeenCalled();
  });
});
