'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div />
      <div className="flex items-center gap-4">
        {session?.user && (
          <>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {session.user.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
              data-testid="sign-out-button"
            >
              로그아웃
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
