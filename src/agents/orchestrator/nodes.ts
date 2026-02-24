import { generateText } from 'ai';
import { models } from '@/lib/ai/providers';
import type { OrchestratorStateType } from './state';
import type { AgentType, AgentStep } from '@/agents/_shared';

const ROUTING_PROMPT = `You are a task router. Analyze the user's query and determine which agent should handle it.

Available agents:
- research: For web searches, information gathering, summarization, fact-checking
- code: For code generation, debugging, code review, programming questions
- data: For data analysis, statistics, chart creation, CSV processing
- content: For writing documents, emails, reports, creative content

Respond with ONLY the agent name (research, code, data, or content). No explanation.`;

export async function routeNode(
  state: OrchestratorStateType
): Promise<Partial<OrchestratorStateType>> {
  const { text } = await generateText({
    model: models['claude-haiku'],
    system: ROUTING_PROMPT,
    prompt: state.query,
    maxOutputTokens: 20,
  });

  const agent = text.trim().toLowerCase() as AgentType;
  const validAgents: AgentType[] = ['research', 'code', 'data', 'content'];
  const selectedAgent = validAgents.includes(agent) ? agent : 'research';

  const step: AgentStep = {
    id: `step-route-${Date.now()}`,
    agentType: 'orchestrator',
    action: 'route',
    input: state.query,
    output: selectedAgent,
    timestamp: Date.now(),
  };

  return {
    selectedAgent,
    steps: [step],
  };
}

export async function executeNode(
  state: OrchestratorStateType
): Promise<Partial<OrchestratorStateType>> {
  const systemPrompts: Record<string, string> = {
    research: 'You are a research assistant. Provide thorough, well-sourced answers. Cite your reasoning.',
    code: 'You are a coding assistant. Provide clean, well-documented code with explanations.',
    data: 'You are a data analysis assistant. Provide clear statistical insights and suggest visualizations.',
    content: 'You are a content creation assistant. Write clear, engaging content.',
  };

  const system = systemPrompts[state.selectedAgent] ?? systemPrompts.research;

  const { text, usage } = await generateText({
    model: models['claude-sonnet'],
    system,
    messages: state.messages.map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    })),
    maxOutputTokens: 4096,
  });

  const step: AgentStep = {
    id: `step-exec-${Date.now()}`,
    agentType: state.selectedAgent,
    action: 'generate',
    input: state.query,
    output: `Generated ${usage.outputTokens ?? 0} tokens`,
    timestamp: Date.now(),
  };

  return {
    output: text,
    steps: [step],
    messages: [{ role: 'assistant', content: text }],
    isComplete: true,
  };
}

export function shouldContinue(state: OrchestratorStateType): string {
  if (state.error) return '__end__';
  if (state.isComplete) return '__end__';
  return 'execute';
}
