interface AgentStepCardProps {
  step: {
    id: string;
    agentType: string;
    action: string;
    input: string;
    output: string;
    timestamp: number;
  };
  isActive?: boolean;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function AgentStepCard({ step, isActive }: AgentStepCardProps) {
  return (
    <div
      data-testid="agent-step-card"
      data-active={isActive ? 'true' : 'false'}
      className={`rounded-lg border p-3 text-sm ${
        isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-xs px-2 py-0.5 rounded bg-gray-100">
            {step.agentType}
          </span>
          <span className="text-gray-500">{step.action}</span>
        </div>
        <span className="text-xs text-gray-400">{formatTime(step.timestamp)}</span>
      </div>
      <p className="text-gray-700">{step.output}</p>
    </div>
  );
}
