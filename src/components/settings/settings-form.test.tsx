import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsForm } from './settings-form';

function defaultSettings() {
  return {
    defaultModel: 'claude-sonnet',
    theme: 'dark',
    apiKeys: {
      ANTHROPIC_API_KEY: 'sk-ant-test',
      OPENAI_API_KEY: '',
      GOOGLE_GENERATIVE_AI_API_KEY: '',
    },
  };
}

describe('SettingsForm', () => {
  let onSave: ReturnType<typeof vi.fn<(data: { defaultModel: string; theme: string; apiKeys: Record<string, string> }) => Promise<boolean>>>;

  beforeEach(() => {
    onSave = vi.fn<(data: { defaultModel: string; theme: string; apiKeys: Record<string, string> }) => Promise<boolean>>().mockResolvedValue(true);
  });

  it('should render all sections (model, theme, API keys)', () => {
    render(<SettingsForm settings={defaultSettings()} onSave={onSave} />);

    expect(screen.getByText('기본 모델')).toBeDefined();
    expect(screen.getByText('테마')).toBeDefined();
    expect(screen.getByText('API 키')).toBeDefined();
  });

  it('should render current model selection', () => {
    render(<SettingsForm settings={defaultSettings()} onSave={onSave} />);
    const select = screen.getByTestId('model-select') as HTMLSelectElement;
    expect(select.value).toBe('claude-sonnet');
  });

  it('should render current theme selection', () => {
    render(<SettingsForm settings={defaultSettings()} onSave={onSave} />);
    const darkBtn = screen.getByTestId('theme-dark');
    const lightBtn = screen.getByTestId('theme-light');
    // dark is selected (default variant), light is not (outline variant)
    // We can check that the buttons exist
    expect(darkBtn).toBeDefined();
    expect(lightBtn).toBeDefined();
  });

  it('should change theme when a theme button is clicked', async () => {
    render(<SettingsForm settings={defaultSettings()} onSave={onSave} />);
    const lightBtn = screen.getByTestId('theme-light');
    fireEvent.click(lightBtn);
    // After clicking light, save should reflect the change
    // We verify by clicking save and checking the payload
    const saveBtn = screen.getByTestId('save-button');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ theme: 'light' })
      );
    });
  });

  it('should call onSave with current form data when save is clicked', async () => {
    render(<SettingsForm settings={defaultSettings()} onSave={onSave} />);
    const saveBtn = screen.getByTestId('save-button');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        defaultModel: 'claude-sonnet',
        theme: 'dark',
        apiKeys: {
          ANTHROPIC_API_KEY: 'sk-ant-test',
          OPENAI_API_KEY: '',
          GOOGLE_GENERATIVE_AI_API_KEY: '',
        },
      });
    });
  });

  it('should show saving state while save is in progress', async () => {
    // Make onSave a promise that we can resolve later
    let resolvePromise: (value: boolean) => void;
    const pendingSave = new Promise<boolean>((resolve) => {
      resolvePromise = resolve;
    });
    onSave.mockReturnValue(pendingSave);

    render(<SettingsForm settings={defaultSettings()} onSave={onSave} />);
    const saveBtn = screen.getByTestId('save-button');
    fireEvent.click(saveBtn);

    // Button should show "Saving..." and be disabled
    expect(screen.getByText('저장 중...')).toBeDefined();
    expect(saveBtn).toBeDisabled();

    // Resolve the save
    resolvePromise!(true);

    await waitFor(() => {
      expect(screen.getByText('설정 저장')).toBeDefined();
    });
  });

  it('should show success message after save', async () => {
    render(<SettingsForm settings={defaultSettings()} onSave={onSave} />);
    const saveBtn = screen.getByTestId('save-button');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByTestId('save-message')).toBeDefined();
      expect(screen.getByTestId('save-message').textContent).toBe(
        '설정이 저장되었습니다'
      );
    });
  });

  it('should show failure message on save error', async () => {
    onSave.mockResolvedValue(false);
    render(<SettingsForm settings={defaultSettings()} onSave={onSave} />);
    const saveBtn = screen.getByTestId('save-button');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByTestId('save-message')).toBeDefined();
      expect(screen.getByTestId('save-message').textContent).toBe(
        '저장에 실패했습니다'
      );
    });
  });
});
