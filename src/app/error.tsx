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
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">문제가 발생했습니다</h1>
        <p className="mt-2 text-zinc-500" data-testid="error-message">
          {error.message || '예상치 못한 오류가 발생했습니다'}
        </p>
      </div>
      <Button onClick={reset} data-testid="error-reset">
        다시 시도
      </Button>
    </div>
  );
}
