import { Spinner } from '@/components/ui/spinner';

export default function WorkspaceLoading() {
  return (
    <div className="flex h-full items-center justify-center" data-testid="workspace-loading">
      <Spinner size="md" />
    </div>
  );
}
