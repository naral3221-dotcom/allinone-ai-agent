'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4" data-testid="global-error">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">Something went wrong</h1>
        <p className="mt-2 text-zinc-500" data-testid="error-message">
          {error.message || 'An unexpected error occurred'}
        </p>
      </div>
      <Button onClick={reset} data-testid="error-reset">
        Try again
      </Button>
    </div>
  );
}
