import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks (hoisted to top so vi.mock calls resolve correctly)
// ---------------------------------------------------------------------------

const { mockGenerateText } = vi.hoisted(() => ({
  mockGenerateText: vi.fn(),
}));
vi.mock('ai', () => ({ generateText: mockGenerateText }));

vi.mock('@/lib/ai/providers', () => ({
  models: {
    'claude-haiku': { modelId: 'claude-haiku' },
    'claude-sonnet': { modelId: 'claude-sonnet' },
  },
}));

// ---------------------------------------------------------------------------
// System under test
// ---------------------------------------------------------------------------

import { WorkflowEngine } from './engine';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('WorkflowEngine', () => {
  const engine = new WorkflowEngine();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Single-step execution
  // -------------------------------------------------------------------------

  it('should execute a single-step workflow', async () => {
    mockGenerateText.mockResolvedValue({ text: 'Research results about AI' });

    const result = await engine.execute({
      steps: [
        { id: 'step-1', order: 0, agentType: 'research', prompt: 'Find info about AI' },
      ],
    });

    expect(result.status).toBe('completed');
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].stepId).toBe('step-1');
    expect(result.steps[0].agentType).toBe('research');
    expect(result.steps[0].output).toBe('Research results about AI');
    expect(result.steps[0].status).toBe('success');
    expect(result.finalOutput).toBe('Research results about AI');
    expect(result.totalDuration).toBeGreaterThanOrEqual(0);
  });

  // -------------------------------------------------------------------------
  // Multi-step execution
  // -------------------------------------------------------------------------

  it('should execute multi-step workflow sequentially', async () => {
    mockGenerateText
      .mockResolvedValueOnce({ text: 'Raw research data' })
      .mockResolvedValueOnce({ text: 'Polished summary of research' });

    const result = await engine.execute({
      steps: [
        { id: 'step-1', order: 0, agentType: 'research', prompt: 'Research topic X' },
        { id: 'step-2', order: 1, agentType: 'content', prompt: 'Summarize findings' },
      ],
    });

    expect(result.status).toBe('completed');
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0].output).toBe('Raw research data');
    expect(result.steps[1].output).toBe('Polished summary of research');
    expect(result.finalOutput).toBe('Polished summary of research');
  });

  // -------------------------------------------------------------------------
  // System prompt by agentType
  // -------------------------------------------------------------------------

  it('should call generateText with appropriate system prompt based on agentType', async () => {
    mockGenerateText.mockResolvedValue({ text: 'output' });

    await engine.execute({
      steps: [
        { id: 'step-1', order: 0, agentType: 'research', prompt: 'Find data' },
      ],
    });

    const callArgs = mockGenerateText.mock.calls[0][0];
    expect(callArgs.system).toContain('research');
  });

  // -------------------------------------------------------------------------
  // Context passing between steps
  // -------------------------------------------------------------------------

  it('should pass previous step output as context in the prompt', async () => {
    mockGenerateText
      .mockResolvedValueOnce({ text: 'Step 1 output data' })
      .mockResolvedValueOnce({ text: 'Step 2 final output' });

    await engine.execute({
      steps: [
        { id: 'step-1', order: 0, agentType: 'research', prompt: 'Research topic' },
        { id: 'step-2', order: 1, agentType: 'content', prompt: 'Write summary' },
      ],
    });

    // First call should NOT have previous output
    const firstCallArgs = mockGenerateText.mock.calls[0][0];
    expect(firstCallArgs.prompt).toBe('Research topic');

    // Second call should include previous step output
    const secondCallArgs = mockGenerateText.mock.calls[1][0];
    expect(secondCallArgs.prompt).toContain('Write summary');
    expect(secondCallArgs.prompt).toContain('Step 1 output data');
    expect(secondCallArgs.prompt).toContain('Previous step output:');
  });

  // -------------------------------------------------------------------------
  // Duration tracking
  // -------------------------------------------------------------------------

  it('should return all step results with durations', async () => {
    mockGenerateText
      .mockResolvedValueOnce({ text: 'output 1' })
      .mockResolvedValueOnce({ text: 'output 2' })
      .mockResolvedValueOnce({ text: 'output 3' });

    const result = await engine.execute({
      steps: [
        { id: 'step-1', order: 0, agentType: 'research', prompt: 'Step 1' },
        { id: 'step-2', order: 1, agentType: 'code', prompt: 'Step 2' },
        { id: 'step-3', order: 2, agentType: 'content', prompt: 'Step 3' },
      ],
    });

    expect(result.steps).toHaveLength(3);
    result.steps.forEach((step) => {
      expect(typeof step.duration).toBe('number');
      expect(step.duration).toBeGreaterThanOrEqual(0);
    });
    expect(result.totalDuration).toBeGreaterThanOrEqual(0);
  });

  // -------------------------------------------------------------------------
  // Final output
  // -------------------------------------------------------------------------

  it('should set finalOutput to last step output', async () => {
    mockGenerateText
      .mockResolvedValueOnce({ text: 'first' })
      .mockResolvedValueOnce({ text: 'second' })
      .mockResolvedValueOnce({ text: 'the final answer' });

    const result = await engine.execute({
      steps: [
        { id: 'step-1', order: 0, agentType: 'research', prompt: 'A' },
        { id: 'step-2', order: 1, agentType: 'code', prompt: 'B' },
        { id: 'step-3', order: 2, agentType: 'content', prompt: 'C' },
      ],
    });

    expect(result.finalOutput).toBe('the final answer');
  });

  // -------------------------------------------------------------------------
  // Error handling
  // -------------------------------------------------------------------------

  it('should handle step failure and mark workflow as failed', async () => {
    mockGenerateText.mockRejectedValue(new Error('LLM API error'));

    const result = await engine.execute({
      steps: [
        { id: 'step-1', order: 0, agentType: 'research', prompt: 'Find info' },
      ],
    });

    expect(result.status).toBe('failed');
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].status).toBe('error');
    expect(result.steps[0].error).toBe('LLM API error');
  });

  it('should stop execution on first failure', async () => {
    mockGenerateText
      .mockResolvedValueOnce({ text: 'step 1 ok' })
      .mockRejectedValueOnce(new Error('Step 2 failed'))
      .mockResolvedValueOnce({ text: 'step 3 should not run' });

    const result = await engine.execute({
      steps: [
        { id: 'step-1', order: 0, agentType: 'research', prompt: 'A' },
        { id: 'step-2', order: 1, agentType: 'code', prompt: 'B' },
        { id: 'step-3', order: 2, agentType: 'content', prompt: 'C' },
      ],
    });

    expect(result.status).toBe('failed');
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0].status).toBe('success');
    expect(result.steps[1].status).toBe('error');
    expect(result.steps[1].error).toBe('Step 2 failed');
    // Step 3 should NOT have been executed
    expect(mockGenerateText).toHaveBeenCalledTimes(2);
  });
});
