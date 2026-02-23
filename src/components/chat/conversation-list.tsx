'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

export interface ConversationItem {
  id: string;
  title: string | null;
  updatedAt: string;
}

interface ConversationListProps {
  conversations: ConversationItem[];
  onDelete?: (id: string) => void;
}

export function ConversationList({
  conversations,
  onDelete,
}: ConversationListProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-1">
      {conversations.map((conv) => {
        const isActive = pathname === `/chat/${conv.id}`;
        return (
          <div
            key={conv.id}
            className={cn(
              'group flex items-center rounded-md text-sm transition-colors',
              isActive
                ? 'bg-zinc-200 dark:bg-zinc-800'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-900'
            )}
          >
            <Link
              href={`/chat/${conv.id}`}
              className="flex-1 truncate px-3 py-2 text-zinc-700 dark:text-zinc-300"
            >
              {conv.title || 'Untitled'}
            </Link>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(conv.id);
                }}
                className="mr-2 hidden rounded p-1 text-zinc-400 hover:bg-zinc-300 hover:text-zinc-600 group-hover:block dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
                aria-label={`Delete ${conv.title || 'conversation'}`}
              >
                x
              </button>
            )}
          </div>
        );
      })}
      {conversations.length === 0 && (
        <p className="px-3 py-2 text-xs text-zinc-400">No conversations yet</p>
      )}
    </div>
  );
}
