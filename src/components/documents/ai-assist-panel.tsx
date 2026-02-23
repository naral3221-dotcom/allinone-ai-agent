'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

type AssistAction =
  | 'improve'
  | 'expand'
  | 'summarize'
  | 'translate'
  | 'fix-grammar'
  | 'change-tone';

const ACTIONS: { action: AssistAction; label: string }[] = [
  { action: 'improve', label: 'Improve' },
  { action: 'expand', label: 'Expand' },
  { action: 'summarize', label: 'Summarize' },
  { action: 'translate', label: 'Translate' },
  { action: 'fix-grammar', label: 'Fix Grammar' },
  { action: 'change-tone', label: 'Change Tone' },
];

interface AiAssistPanelProps {
  onAction: (
    action: string,
    text: string,
    options?: { language?: string; tone?: string }
  ) => Promise<string | null>;
  selectedText: string;
}

export function AiAssistPanel({ onAction, selectedText }: AiAssistPanelProps) {
  const [result, setResult] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [language, setLanguage] = useState('Korean');
  const [tone, setTone] = useState('professional');

  const handleAction = useCallback(
    async (action: AssistAction) => {
      if (!selectedText) return;
      setActiveAction(action);
      setResult(null);
      const options: { language?: string; tone?: string } = {};
      if (action === 'translate') options.language = language;
      if (action === 'change-tone') options.tone = tone;
      const res = await onAction(action, selectedText, options);
      setResult(res);
      setActiveAction(null);
    },
    [selectedText, onAction, language, tone]
  );

  return (
    <div
      data-testid="ai-assist-panel"
      className="w-72 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h3 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
        AI Assist
      </h3>
      {!selectedText && (
        <p className="text-xs text-zinc-400 mb-3">
          Select text in the editor to use AI Assist.
        </p>
      )}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {ACTIONS.map(({ action, label }) => (
          <Button
            key={action}
            variant="outline"
            size="sm"
            disabled={!selectedText || activeAction !== null}
            onClick={() => handleAction(action)}
            data-testid={`assist-${action}`}
          >
            {activeAction === action ? '...' : label}
          </Button>
        ))}
      </div>

      {/* Options for translate/change-tone */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-500 w-16">Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="h-7 rounded border border-zinc-200 px-2 text-xs dark:border-zinc-800 dark:bg-zinc-950"
            data-testid="assist-language"
          >
            <option>Korean</option>
            <option>English</option>
            <option>Japanese</option>
            <option>Chinese</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-500 w-16">Tone:</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="h-7 rounded border border-zinc-200 px-2 text-xs dark:border-zinc-800 dark:bg-zinc-950"
            data-testid="assist-tone"
          >
            <option>professional</option>
            <option>casual</option>
            <option>formal</option>
            <option>friendly</option>
          </select>
        </div>
      </div>

      {result && (
        <div
          data-testid="assist-result"
          className="rounded-md border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
        >
          {result}
        </div>
      )}
    </div>
  );
}
