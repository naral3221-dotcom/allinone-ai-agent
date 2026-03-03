'use client';

import { type FormEvent, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onStop?: () => void;
}

export function ChatInput({
  input,
  isLoading,
  onInputChange,
  onSubmit,
  onStop,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <form onSubmit={onSubmit} className="border-t border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (input.trim() && !isLoading) {
                onSubmit(e as unknown as FormEvent<HTMLFormElement>);
              }
            }
          }}
          placeholder="메시지를 입력하세요..."
          rows={1}
          className="flex-1 resize-none rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:placeholder:text-zinc-600"
        />
        {isLoading ? (
          <Button type="button" variant="outline" size="sm" onClick={onStop}>
            중지
          </Button>
        ) : (
          <Button type="submit" size="sm" disabled={!input.trim()}>
            전송
          </Button>
        )}
      </div>
    </form>
  );
}
