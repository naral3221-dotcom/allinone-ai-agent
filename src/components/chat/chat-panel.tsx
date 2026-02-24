'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useMemo, type FormEvent } from 'react';
import type { ModelId } from '@/lib/ai/models';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { ModelSelector } from './model-selector';

interface ChatPanelProps {
  conversationId: string;
}

export function ChatPanel({ conversationId }: ChatPanelProps) {
  const [modelId, setModelId] = useState<ModelId>('claude-sonnet');
  const [input, setInput] = useState('');

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: { modelId, conversationId },
      }),
    [modelId, conversationId]
  );

  const { messages, sendMessage, status, stop } = useChat({
    id: conversationId,
    transport,
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput('');
    await sendMessage({ text });
  };

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
        onInputChange={setInput}
        onSubmit={handleSubmit}
        onStop={stop}
      />
    </div>
  );
}
