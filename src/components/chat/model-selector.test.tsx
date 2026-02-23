import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModelSelector } from './model-selector';

describe('ModelSelector', () => {
  it('should render with selected model', () => {
    render(
      <ModelSelector selectedModel="claude-sonnet" onModelChange={vi.fn()} />
    );
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('claude-sonnet');
  });

  it('should show all models', () => {
    render(
      <ModelSelector selectedModel="claude-sonnet" onModelChange={vi.fn()} />
    );
    const options = screen.getAllByRole('option');
    expect(options.length).toBe(7);
  });

  it('should call onModelChange when selection changes', () => {
    const onModelChange = vi.fn();
    render(
      <ModelSelector selectedModel="claude-sonnet" onModelChange={onModelChange} />
    );
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'gpt-4o' } });
    expect(onModelChange).toHaveBeenCalledWith('gpt-4o');
  });
});
