'use client';

import { useState, useEffect, useCallback } from 'react';

interface UserSettings {
  id: string;
  defaultModel: string;
  theme: string;
  apiKeys: Record<string, string> | null;
  mcpServers: unknown;
  agentPreferences: unknown;
}

interface UseSettingsReturn {
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  updateSettings: (
    data: Partial<Pick<UserSettings, 'defaultModel' | 'theme' | 'apiKeys'>>
  ) => Promise<boolean>;
  refresh: () => void;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      setSettings(data.settings ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(
    async (
      data: Partial<Pick<UserSettings, 'defaultModel' | 'theme' | 'apiKeys'>>
    ): Promise<boolean> => {
      try {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update settings');
        const responseData = await res.json();
        setSettings(responseData.settings ?? null);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    []
  );

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    refresh: fetchSettings,
  };
}
