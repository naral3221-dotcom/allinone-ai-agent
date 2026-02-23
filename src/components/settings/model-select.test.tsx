import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModelSelect } from './model-select';

describe('ModelSelect', () => {
  it('should render a select element', () => {
    render(<ModelSelect value="claude-sonnet" onChange={vi.fn()} />);
    const select = screen.getByTestId('model-select');
    expect(select).toBeDefined();
    expect(select.tagName).toBe('SELECT');
  });

  it('should render all model options from MODEL_REGISTRY', () => {
    render(<ModelSelect value="claude-sonnet" onChange={vi.fn()} />);
    const options = screen.getAllByRole('option');
    expect(options.length).toBe(7);
  });

  it('should display the currently selected value', () => {
    render(<ModelSelect value="gpt-4o" onChange={vi.fn()} />);
    const select = screen.getByTestId('model-select') as HTMLSelectElement;
    expect(select.value).toBe('gpt-4o');
  });

  it('should call onChange when selection changes', () => {
    const onChange = vi.fn();
    render(<ModelSelect value="claude-sonnet" onChange={onChange} />);
    const select = screen.getByTestId('model-select');
    fireEvent.change(select, { target: { value: 'gemini-2.5-pro' } });
    expect(onChange).toHaveBeenCalledWith('gemini-2.5-pro');
  });
});
