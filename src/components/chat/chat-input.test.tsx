import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatInput } from './chat-input';

describe('ChatInput', () => {
  const defaultProps = {
    input: '',
    isLoading: false,
    onInputChange: vi.fn(),
    onSubmit: vi.fn((e) => e.preventDefault()),
  };

  it('should render textarea and send button', () => {
    render(<ChatInput {...defaultProps} />);
    expect(screen.getByPlaceholderText('메시지를 입력하세요...')).toBeDefined();
    expect(screen.getByText('전송')).toBeDefined();
  });

  it('should disable send button when input is empty', () => {
    render(<ChatInput {...defaultProps} />);
    const button = screen.getByText('전송');
    expect(button.hasAttribute('disabled')).toBe(true);
  });

  it('should enable send button when input has text', () => {
    render(<ChatInput {...defaultProps} input="hello" />);
    const button = screen.getByText('전송');
    expect(button.hasAttribute('disabled')).toBe(false);
  });

  it('should show stop button when loading', () => {
    render(<ChatInput {...defaultProps} isLoading onStop={vi.fn()} />);
    expect(screen.getByText('중지')).toBeDefined();
  });

  it('should call onInputChange when typing', () => {
    const onInputChange = vi.fn();
    render(<ChatInput {...defaultProps} onInputChange={onInputChange} />);
    const textarea = screen.getByPlaceholderText('메시지를 입력하세요...');
    fireEvent.change(textarea, { target: { value: 'test' } });
    expect(onInputChange).toHaveBeenCalledWith('test');
  });
});
