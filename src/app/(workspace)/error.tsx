'use client';

import { Button } from '@/components/ui/button';

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4" data-testid="workspace-error">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Something went wrong</h2>
        <p className="mt-2 text-sm text-zinc-500" data-testid="workspace-error-message">
          {error.message || 'An unexpected error occurred'}
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={reset} data-testid="workspace-error-reset">Try again</Button>
        <Button variant="outline" onClick={() => window.location.href = '/chat'} data-testid="workspace-error-home">
          Go to Chat
        </Button>
      </div>
    </div>
  );
}
