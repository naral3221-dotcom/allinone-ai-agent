import { AgentRunService } from './agent-run.service';

const globalForAgentRun = globalThis as unknown as {
  agentRunService: AgentRunService | undefined;
};

export const agentRunService =
  globalForAgentRun.agentRunService ?? new AgentRunService();

if (process.env.NODE_ENV !== 'production') {
  globalForAgentRun.agentRunService = agentRunService;
}
