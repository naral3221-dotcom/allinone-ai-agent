import { describe, it, expect } from 'vitest';
import type {
  AgentType,
  AgentRunInput,
  AgentRunResult,
  AgentGraphState,
  ToolCallRecord,
} from './agent.types';

describe('Agent Domain Types', () => {
  it('should define valid AgentType values', () => {
    const types: AgentType[] = ['orchestrator', 'research', 'code', 'data', 'content'];
    expect(types).toHaveLength(5);
  });

  it('should create valid AgentRunInput', () => {
    const input: AgentRunInput = {
      query: 'Search for latest AI news',
      conversationId: 'conv-1',
      context: ['previous message'],
    };
    expect(input.query).toBe('Search for latest AI news');
  });

  it('should create valid AgentRunResult', () => {
    const result: AgentRunResult = {
      output: 'Here are the results...',
      steps: [{
        id: 'step-1',
        agentType: 'research',
        action: 'web_search',
        input: 'AI news 2026',
        output: '3 results found',
        timestamp: Date.now(),
      }],
      toolCalls: [{
        id: 'tc-1',
        toolName: 'tavily_search',
        input: { query: 'AI news' },
        output: { results: [] },
        duration: 1200,
        status: 'success',
      }],
      model: 'claude-sonnet',
      duration: 3500,
    };
    expect(result.steps).toHaveLength(1);
    expect(result.toolCalls[0].status).toBe('success');
  });

  it('should create valid initial AgentGraphState', () => {
    const state: AgentGraphState = {
      messages: [],
      query: 'test query',
      agentType: 'orchestrator',
      steps: [],
      toolCalls: [],
      output: '',
      isComplete: false,
    };
    expect(state.isComplete).toBe(false);
    expect(state.agentType).toBe('orchestrator');
  });

  it('should handle ToolCallRecord with error', () => {
    const record: ToolCallRecord = {
      id: 'tc-err',
      toolName: 'web_search',
      input: { query: 'test' },
      output: null,
      duration: 500,
      status: 'error',
      error: 'Rate limit exceeded',
    };
    expect(record.status).toBe('error');
    expect(record.error).toBeDefined();
  });
});
