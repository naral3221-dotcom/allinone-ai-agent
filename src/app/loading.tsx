import { Spinner } from '@/components/ui/spinner';

export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center" data-testid="global-loading">
      <Spinner size="lg" />
    </div>
  );
}
