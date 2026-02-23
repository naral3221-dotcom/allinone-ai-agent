interface ToolCallCardProps {
  toolCall: {
    id: string;
    toolName: string;
    input: Record<string, unknown>;
    output: unknown;
    duration: number;
    status: 'success' | 'error';
    error?: string;
  };
}

function formatDuration(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  return `${ms}ms`;
}

export function ToolCallCard({ toolCall }: ToolCallCardProps) {
  return (
    <div
      data-testid="tool-call-card"
      data-status={toolCall.status}
      className={`rounded-lg border p-3 text-sm ${
        toolCall.status === 'error' ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono font-medium">{toolCall.toolName}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{formatDuration(toolCall.duration)}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              toolCall.status === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {toolCall.status}
          </span>
        </div>
      </div>
      <pre className="text-xs bg-gray-100 rounded p-2 overflow-x-auto">
        {JSON.stringify(toolCall.input, null, 2)}
      </pre>
      {toolCall.status === 'error' && toolCall.error && (
        <p className="mt-2 text-xs text-red-600">{toolCall.error}</p>
      )}
    </div>
  );
}
