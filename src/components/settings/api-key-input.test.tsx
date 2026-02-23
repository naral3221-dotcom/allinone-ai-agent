import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ApiKeyInput } from './api-key-input';

describe('ApiKeyInput', () => {
  it('should render the label', () => {
    render(
      <ApiKeyInput label="ANTHROPIC_API_KEY" value="" onChange={vi.fn()} />
    );
    expect(screen.getByText('ANTHROPIC_API_KEY')).toBeDefined();
  });

  it('should render a password input by default (masked)', () => {
    render(
      <ApiKeyInput
        label="ANTHROPIC_API_KEY"
        value="sk-ant-1234"
        onChange={vi.fn()}
      />
    );
    const input = screen.getByTestId(
      'api-key-input-ANTHROPIC_API_KEY'
    ) as HTMLInputElement;
    expect(input.type).toBe('password');
  });

  it('should toggle to text input when Show is clicked', () => {
    render(
      <ApiKeyInput
        label="ANTHROPIC_API_KEY"
        value="sk-ant-1234"
        onChange={vi.fn()}
      />
    );
    const toggleBtn = screen.getByTestId('api-key-toggle-ANTHROPIC_API_KEY');
    expect(toggleBtn.textContent).toBe('Show');

    fireEvent.click(toggleBtn);

    const input = screen.getByTestId(
      'api-key-input-ANTHROPIC_API_KEY'
    ) as HTMLInputElement;
    expect(input.type).toBe('text');
    expect(toggleBtn.textContent).toBe('Hide');
  });

  it('should call onChange when typing', () => {
    const onChange = vi.fn();
    render(
      <ApiKeyInput label="OPENAI_API_KEY" value="" onChange={onChange} />
    );
    const input = screen.getByTestId('api-key-input-OPENAI_API_KEY');
    fireEvent.change(input, { target: { value: 'sk-new-key' } });
    expect(onChange).toHaveBeenCalledWith('sk-new-key');
  });

  it('should show placeholder when value is empty', () => {
    render(
      <ApiKeyInput label="OPENAI_API_KEY" value="" onChange={vi.fn()} />
    );
    const input = screen.getByTestId(
      'api-key-input-OPENAI_API_KEY'
    ) as HTMLInputElement;
    expect(input.placeholder).toBe('Enter API key...');
  });
});
