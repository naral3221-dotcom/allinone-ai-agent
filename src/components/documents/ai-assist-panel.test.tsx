import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AiAssistPanel } from './ai-assist-panel';

describe('AiAssistPanel', () => {
  const defaultProps = {
    onAction: vi.fn().mockResolvedValue('Improved text result'),
    selectedText: '',
  };

  it('should render all 6 action buttons', () => {
    render(<AiAssistPanel {...defaultProps} />);
    expect(screen.getByTestId('assist-improve')).toBeDefined();
    expect(screen.getByTestId('assist-expand')).toBeDefined();
    expect(screen.getByTestId('assist-summarize')).toBeDefined();
    expect(screen.getByTestId('assist-translate')).toBeDefined();
    expect(screen.getByTestId('assist-fix-grammar')).toBeDefined();
    expect(screen.getByTestId('assist-change-tone')).toBeDefined();
  });

  it('should show hint when no text is selected', () => {
    render(<AiAssistPanel {...defaultProps} />);
    expect(
      screen.getByText('Select text in the editor to use AI Assist.')
    ).toBeDefined();
  });

  it('should disable buttons when no text is selected', () => {
    render(<AiAssistPanel {...defaultProps} />);
    const improveBtn = screen.getByTestId(
      'assist-improve'
    ) as HTMLButtonElement;
    expect(improveBtn.disabled).toBe(true);
  });

  it('should call onAction with action and text when button is clicked', async () => {
    const onAction = vi.fn().mockResolvedValue('result');
    render(
      <AiAssistPanel
        {...defaultProps}
        onAction={onAction}
        selectedText="Some text"
      />
    );
    fireEvent.click(screen.getByTestId('assist-improve'));
    await waitFor(() => {
      expect(onAction).toHaveBeenCalledWith('improve', 'Some text', {});
    });
  });

  it('should show result after action completes', async () => {
    const onAction = vi.fn().mockResolvedValue('AI improved text here');
    render(
      <AiAssistPanel
        {...defaultProps}
        onAction={onAction}
        selectedText="Some text"
      />
    );
    fireEvent.click(screen.getByTestId('assist-improve'));
    await waitFor(() => {
      expect(screen.getByTestId('assist-result')).toBeDefined();
      expect(screen.getByText('AI improved text here')).toBeDefined();
    });
  });

  it('should allow changing language and tone select values', () => {
    render(<AiAssistPanel {...defaultProps} selectedText="text" />);
    const languageSelect = screen.getByTestId(
      'assist-language'
    ) as HTMLSelectElement;
    const toneSelect = screen.getByTestId('assist-tone') as HTMLSelectElement;

    fireEvent.change(languageSelect, { target: { value: 'English' } });
    expect(languageSelect.value).toBe('English');

    fireEvent.change(toneSelect, { target: { value: 'casual' } });
    expect(toneSelect.value).toBe('casual');
  });
});
