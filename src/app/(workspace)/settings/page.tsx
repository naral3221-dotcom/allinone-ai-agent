'use client';

import { useSettings } from '@/hooks/useSettings';
import { SettingsForm } from '@/components/settings/settings-form';

export default function SettingsPage() {
  const { settings, isLoading, error, updateSettings } = useSettings();

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-full"
        data-testid="settings-loading"
      >
        <span className="text-zinc-400">설정 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-center h-full"
        data-testid="settings-error"
      >
        <span className="text-red-500">오류: {error}</span>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        설정
      </h1>
      <SettingsForm
        settings={{
          defaultModel: settings.defaultModel,
          theme: settings.theme,
          apiKeys: settings.apiKeys,
        }}
        onSave={updateSettings}
      />
    </div>
  );
}
