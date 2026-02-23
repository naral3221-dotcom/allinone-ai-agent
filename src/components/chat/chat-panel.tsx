'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';
import type { ModelId } from '@/lib/ai/models';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { ModelSelector } from './model-selector';

interface ChatPanelProps {
  conversationId: string;
}

export function ChatPanel({ conversationId }: ChatPanelProps) {
  const [modelId, setModelId] = useState<ModelId>('claude-sonnet');

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } =
    useChat({
      api: '/api/chat',
      id: conversationId,
      body: { modelId, conversationId },
    });

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          New Chat
        </span>
        <ModelSelector selectedModel={modelId} onModelChange={setModelId} />
      </div>

      <MessageList messages={messages} isLoading={isLoading} />

      <ChatInput
        input={input}
        isLoading={isLoading}
        onInputChange={(value) =>
          handleInputChange({
            target: { value },
          } as React.ChangeEvent<HTMLTextAreaElement>)
        }
        onSubmit={handleSubmit}
        onStop={stop}
      />
    </div>
  );
}
