'use client';

interface ResearchResultProps {
  result: {
    id: string;
    status: string;
    output: string | null;
    error: string | null;
    duration: number | null;
    createdAt: string;
  };
}

function formatDuration(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

export function ResearchResult({ result }: ResearchResultProps) {
  return (
    <div
      data-testid="research-result"
      className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="mb-4 flex items-center justify-between">
        <span
          data-testid="result-status"
          className={`text-xs px-2 py-0.5 rounded ${
            result.status === 'completed'
              ? 'bg-green-100 text-green-700'
              : result.status === 'failed'
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {result.status}
        </span>
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          {result.duration !== null && (
            <span data-testid="result-duration">{formatDuration(result.duration)}</span>
          )}
          <span data-testid="result-date">
            {new Date(result.createdAt).toLocaleString()}
          </span>
        </div>
      </div>

      {result.status === 'failed' && result.error && (
        <p data-testid="result-error" className="text-sm text-red-600">
          {result.error}
        </p>
      )}

      {result.output && (
        <div
          data-testid="result-output"
          className="prose prose-sm dark:prose-invert max-w-none"
        >
          {result.output.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}
    </div>
  );
}
