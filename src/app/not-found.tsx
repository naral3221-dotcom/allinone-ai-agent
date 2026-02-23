import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4" data-testid="not-found">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-zinc-900 dark:text-zinc-100">404</h1>
        <h2 className="mt-2 text-xl font-semibold text-zinc-700 dark:text-zinc-300">Page Not Found</h2>
        <p className="mt-1 text-zinc-500">The page you're looking for doesn't exist.</p>
      </div>
      <Link href="/chat">
        <Button data-testid="go-home">Go to Workspace</Button>
      </Link>
    </div>
  );
}
