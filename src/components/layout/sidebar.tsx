'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import {
  ConversationList,
  type ConversationItem,
} from '@/components/chat/conversation-list';

const NAV_ITEMS = [
  { href: '/chat', label: 'Chat', icon: '💬' },
  { href: '/research', label: 'Research', icon: '🔍' },
  { href: '/documents', label: 'Documents', icon: '📄' },
  { href: '/knowledge', label: 'Knowledge', icon: '📚' },
  { href: '/workflows', label: 'Workflows', icon: '⚡' },
  { href: '/marketing', label: 'Marketing', icon: '📊' },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const isChatRoute = pathname.startsWith('/chat');
  const [conversations, setConversations] = useState<ConversationItem[]>([]);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch {
      // silently fail on network error
    }
  }, []);

  useEffect(() => {
    if (isChatRoute) {
      fetchConversations();
    }
  }, [isChatRoute, fetchConversations]);

  const handleNewChat = async () => {
    try {
      const res = await fetch('/api/conversations', { method: 'POST' });
      if (res.ok) {
        const conv = await res.json();
        window.location.href = `/chat/${conv.id}`;
      }
    } catch {
      // silently fail
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (pathname === `/chat/${id}`) {
          window.location.href = '/chat/new';
        }
      }
    } catch {
      // silently fail
    }
  };

  return (
    <aside className="flex h-full w-60 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex h-14 items-center border-b border-zinc-200 px-4 dark:border-zinc-800">
        <Link href="/chat" className="text-lg font-semibold tracking-tight">
          AI Workspace
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                pathname.startsWith(item.href)
                  ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {isChatRoute && (
          <div className="border-t border-zinc-200 p-2 dark:border-zinc-800">
            <div className="mb-2 flex items-center justify-between px-2">
              <span className="text-xs font-medium text-zinc-400">History</span>
              <Button variant="ghost" size="sm" onClick={handleNewChat}>
                + New
              </Button>
            </div>
            <ConversationList
              conversations={conversations}
              onDelete={handleDelete}
            />
          </div>
        )}
      </nav>

      <div className="border-t border-zinc-200 p-2 dark:border-zinc-800">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          <span>⚙️</span>
          Settings
        </Link>
      </div>
    </aside>
  );
}
