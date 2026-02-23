import { describe, it, expect } from 'vitest';
import type { AgentConfig, AgentState, AgentType } from './agent.types';

describe('Agent Types', () => {
  it('should create a valid AgentConfig', () => {
    const config: AgentConfig = {
      name: 'research-agent',
      type: 'research',
      model: 'claude-sonnet-4-6',
      systemPrompt: 'You are a research agent.',
      tools: [],
      maxIterations: 10,
    };

    expect(config.name).toBe('research-agent');
    expect(config.type).toBe('research');
    expect(config.maxIterations).toBe(10);
  });

  it('should enforce AgentType union', () => {
    const validTypes: AgentType[] = ['orchestrator', 'research', 'code', 'data', 'content'];
    expect(validTypes).toHaveLength(5);
  });

  it('should create a valid initial AgentState', () => {
    const state: AgentState = {
      messages: [],
      currentAgent: 'orchestrator',
      toolResults: [],
      isComplete: false,
    };

    expect(state.isComplete).toBe(false);
    expect(state.messages).toHaveLength(0);
  });
});
