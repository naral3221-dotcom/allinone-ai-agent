'use client';

import type { UIMessage } from 'ai';
import { cn } from '@/lib/utils/cn';
import { MarkdownMessage } from './markdown-message';

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

interface MessageListProps {
  messages: UIMessage[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            AI Workspace
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Start a conversation with your AI assistant.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            'flex',
            message.role === 'user' ? 'justify-end' : 'justify-start'
          )}
        >
          <div
            className={cn(
              'max-w-[80%] rounded-lg px-4 py-2 text-sm',
              message.role === 'user'
                ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
            )}
          >
            <MarkdownMessage content={getMessageText(message)} role={message.role} />
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="rounded-lg bg-zinc-100 px-4 py-2 dark:bg-zinc-800">
            <span className="animate-pulse text-sm text-zinc-500">Thinking...</span>
          </div>
        </div>
      )}
    </div>
  );
}
