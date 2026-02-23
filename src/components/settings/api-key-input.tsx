'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ApiKeyInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ApiKeyInput({ label, value, onChange }: ApiKeyInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div data-testid={`api-key-${label}`} className="flex items-center gap-2">
      <label className="w-64 text-xs font-mono text-zinc-500 truncate">
        {label}
      </label>
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter API key..."
        className="flex-1 h-8 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
        data-testid={`api-key-input-${label}`}
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setVisible(!visible)}
        data-testid={`api-key-toggle-${label}`}
      >
        {visible ? 'Hide' : 'Show'}
      </Button>
    </div>
  );
}
