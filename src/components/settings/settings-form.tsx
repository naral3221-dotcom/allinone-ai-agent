'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { ApiKeyInput } from './api-key-input';
import { ModelSelect } from './model-select';

interface SettingsFormProps {
  settings: {
    defaultModel: string;
    theme: string;
    apiKeys: Record<string, string> | null;
  };
  onSave: (data: {
    defaultModel: string;
    theme: string;
    apiKeys: Record<string, string>;
  }) => Promise<boolean>;
}

const API_KEY_NAMES = [
  'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY',
  'GOOGLE_GENERATIVE_AI_API_KEY',
] as const;

const THEMES = ['light', 'dark', 'system'] as const;

export function SettingsForm({ settings, onSave }: SettingsFormProps) {
  const [defaultModel, setDefaultModel] = useState(settings.defaultModel);
  const [theme, setTheme] = useState(settings.theme);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>(
    settings.apiKeys ?? {}
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    setDefaultModel(settings.defaultModel);
    setTheme(settings.theme);
    setApiKeys(settings.apiKeys ?? {});
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    const success = await onSave({ defaultModel, theme, apiKeys });
    setSaveMessage(success ? '설정이 저장되었습니다' : '저장에 실패했습니다');
    setIsSaving(false);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  return (
    <div data-testid="settings-form" className="space-y-8">
      {/* Default Model */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          기본 모델
        </h3>
        <ModelSelect value={defaultModel} onChange={setDefaultModel} />
      </section>

      {/* Theme */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          테마
        </h3>
        <div className="flex gap-2" data-testid="theme-selector">
          {THEMES.map((t) => (
            <Button
              key={t}
              variant={theme === t ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme(t)}
              data-testid={`theme-${t}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Button>
          ))}
        </div>
      </section>

      {/* API Keys */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          API 키
        </h3>
        <div className="space-y-3">
          {API_KEY_NAMES.map((keyName) => (
            <ApiKeyInput
              key={keyName}
              label={keyName}
              value={apiKeys[keyName] ?? ''}
              onChange={(val) =>
                setApiKeys((prev) => ({ ...prev, [keyName]: val }))
              }
            />
          ))}
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          data-testid="save-button"
        >
          {isSaving ? '저장 중...' : '설정 저장'}
        </Button>
        {saveMessage && (
          <span
            data-testid="save-message"
            className={cn(
              'text-sm',
              saveMessage === '설정이 저장되었습니다'
                ? 'text-green-600'
                : 'text-red-600'
            )}
          >
            {saveMessage}
          </span>
        )}
      </div>
    </div>
  );
}
