import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useSettings } from './useSettings';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function mockSettings(overrides: Record<string, unknown> = {}) {
  return {
    id: 'settings-1',
    defaultModel: 'claude-sonnet-4-20250514',
    theme: 'dark',
    apiKeys: null,
    mcpServers: null,
    agentPreferences: null,
    ...overrides,
  };
}

describe('useSettings', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('fetches settings on mount', async () => {
    const settings = mockSettings();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ settings }),
    });

    const { result } = renderHook(() => useSettings());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.settings).toEqual(settings);
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith('/api/settings');
  });

  it('handles fetch error when API returns non-ok status', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch settings');
    expect(result.current.settings).toBeNull();
  });

  it('handles network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.settings).toBeNull();
  });

  it('updates settings and reflects the change', async () => {
    const settings = mockSettings();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ settings }),
    });

    const { result } = renderHook(() => useSettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const updatedSettings = mockSettings({ theme: 'light' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ settings: updatedSettings }),
    });

    let success: boolean = false;
    await act(async () => {
      success = await result.current.updateSettings({ theme: 'light' });
    });

    expect(success).toBe(true);
    expect(result.current.settings?.theme).toBe('light');
    expect(mockFetch).toHaveBeenLastCalledWith('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: 'light' }),
    });
  });

  it('handles update settings error', async () => {
    const settings = mockSettings();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ settings }),
    });

    const { result } = renderHook(() => useSettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });

    let success: boolean = true;
    await act(async () => {
      success = await result.current.updateSettings({ theme: 'invalid' });
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe('Failed to update settings');
    // Original settings should remain unchanged
    expect(result.current.settings?.theme).toBe('dark');
  });

  it('handles update settings network error', async () => {
    const settings = mockSettings();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ settings }),
    });

    const { result } = renderHook(() => useSettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

    let success: boolean = true;
    await act(async () => {
      success = await result.current.updateSettings({ defaultModel: 'gpt-4' });
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe('Connection refused');
  });

  it('refresh reloads settings from API', async () => {
    const settings = mockSettings();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ settings }),
    });

    const { result } = renderHook(() => useSettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const refreshedSettings = mockSettings({
      defaultModel: 'gpt-4',
      theme: 'light',
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ settings: refreshedSettings }),
    });

    await act(async () => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.settings?.defaultModel).toBe('gpt-4');
    expect(result.current.settings?.theme).toBe('light');
  });
});
