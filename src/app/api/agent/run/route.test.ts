import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks (hoisted to top so vi.mock calls resolve correctly)
// ---------------------------------------------------------------------------

const { mockGetAuthenticatedUser } = vi.hoisted(() => ({
  mockGetAuthenticatedUser: vi.fn(),
}));
vi.mock('@/lib/auth/get-user', () => ({
  getAuthenticatedUser: mockGetAuthenticatedUser,
}));

const { mockAgentRunService } = vi.hoisted(() => ({
  mockAgentRunService: {
    createRun: vi.fn(),
    completeRun: vi.fn(),
    failRun: vi.fn(),
    listRuns: vi.fn(),
  },
}));
vi.mock('@/lib/db/agent-run.service.singleton', () => ({
  agentRunService: mockAgentRunService,
}));

const { mockOrchestratorInvoke } = vi.hoisted(() => ({
  mockOrchestratorInvoke: vi.fn(),
}));
vi.mock('@/agents/orchestrator/graph', () => ({
  createOrchestratorGraph: () => ({
    invoke: mockOrchestratorInvoke,
  }),
}));

// ---------------------------------------------------------------------------
// System under test
// ---------------------------------------------------------------------------

import { POST, GET } from './route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePostRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost/api/agent/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeGetRequest(queryParams?: string): Request {
  const url = queryParams
    ? `http://localhost/api/agent/run?${queryParams}`
    : 'http://localhost/api/agent/run';
  return new Request(url, { method: 'GET' });
}

const MOCK_USER = { id: 'user-1', email: 'test@example.com' };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/agent/run', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const response = await POST(makePostRequest({ query: 'hello' }));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockAgentRunService.createRun).not.toHaveBeenCalled();
    expect(mockOrchestratorInvoke).not.toHaveBeenCalled();
  });

  it('should return 400 if query is missing', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const response = await POST(makePostRequest({}));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/query/i);
    expect(mockAgentRunService.createRun).not.toHaveBeenCalled();
  });

  it('should return 400 if query is empty string', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const response = await POST(makePostRequest({ query: '' }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/query/i);
  });

  it('should create run, invoke orchestrator, complete run, and return result', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const createdRun = {
      id: 'run-1',
      userId: MOCK_USER.id,
      status: 'running',
      query: 'What is quantum computing?',
      agentType: 'orchestrator',
    };
    mockAgentRunService.createRun.mockResolvedValue(createdRun);

    const orchestratorOutput = {
      output: 'Quantum computing uses quantum bits...',
      selectedAgent: 'research',
      steps: [
        {
          id: 'step-route-1',
          agentType: 'orchestrator',
          action: 'route',
          input: 'What is quantum computing?',
          output: 'research',
          timestamp: 1700000000000,
        },
        {
          id: 'step-exec-1',
          agentType: 'research',
          action: 'generate',
          input: 'What is quantum computing?',
          output: 'Generated 150 tokens',
          timestamp: 1700000001000,
        },
      ],
      toolCalls: [],
      isComplete: true,
    };
    mockOrchestratorInvoke.mockResolvedValue(orchestratorOutput);

    const completedRun = {
      ...createdRun,
      status: 'completed',
      agentType: 'research',
      output: orchestratorOutput.output,
      steps: orchestratorOutput.steps,
      toolCalls: orchestratorOutput.toolCalls,
      model: 'claude-sonnet',
      durationMs: 2500,
    };
    mockAgentRunService.completeRun.mockResolvedValue(completedRun);

    const response = await POST(
      makePostRequest({ query: 'What is quantum computing?' })
    );
    const data = await response.json();

    expect(response.status).toBe(200);

    // Verify the agent run was created with correct params
    expect(mockAgentRunService.createRun).toHaveBeenCalledWith({
      userId: MOCK_USER.id,
      agentType: 'orchestrator',
      input: 'What is quantum computing?',
      conversationId: undefined,
    });

    // Verify orchestrator was invoked with the query
    expect(mockOrchestratorInvoke).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'What is quantum computing?',
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: 'What is quantum computing?' }),
        ]),
      })
    );

    // Verify the run was completed with orchestrator result
    expect(mockAgentRunService.completeRun).toHaveBeenCalledWith(
      'run-1',
      expect.objectContaining({
        output: orchestratorOutput.output,
        steps: orchestratorOutput.steps,
        toolCalls: orchestratorOutput.toolCalls,
      })
    );

    // Verify response shape
    expect(data).toEqual(
      expect.objectContaining({
        runId: 'run-1',
        agentType: 'research',
        output: 'Quantum computing uses quantum bits...',
        steps: expect.any(Array),
        toolCalls: expect.any(Array),
      })
    );
    expect(data.steps).toHaveLength(2);
  });

  it('should pass conversationId to createRun when provided', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const createdRun = {
      id: 'run-2',
      userId: MOCK_USER.id,
      status: 'running',
      query: 'Explain recursion',
      agentType: 'orchestrator',
    };
    mockAgentRunService.createRun.mockResolvedValue(createdRun);
    mockOrchestratorInvoke.mockResolvedValue({
      output: 'Recursion is...',
      selectedAgent: 'code',
      steps: [],
      toolCalls: [],
      isComplete: true,
    });
    mockAgentRunService.completeRun.mockResolvedValue({
      ...createdRun,
      status: 'completed',
    });

    await POST(
      makePostRequest({ query: 'Explain recursion', conversationId: 'conv-42' })
    );

    expect(mockAgentRunService.createRun).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: 'conv-42',
      })
    );
  });

  it('should handle orchestrator failure - create run, mark as failed, return 500', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const createdRun = {
      id: 'run-3',
      userId: MOCK_USER.id,
      status: 'running',
      query: 'Do something',
    };
    mockAgentRunService.createRun.mockResolvedValue(createdRun);

    const orchestratorError = new Error('LLM provider unavailable');
    mockOrchestratorInvoke.mockRejectedValue(orchestratorError);

    mockAgentRunService.failRun.mockResolvedValue({
      ...createdRun,
      status: 'failed',
      error: 'LLM provider unavailable',
    });

    const response = await POST(makePostRequest({ query: 'Do something' }));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();

    // Verify run was created before failure
    expect(mockAgentRunService.createRun).toHaveBeenCalled();

    // Verify run was marked as failed
    expect(mockAgentRunService.failRun).toHaveBeenCalledWith(
      'run-3',
      expect.stringContaining('LLM provider unavailable')
    );

    // Verify completeRun was NOT called
    expect(mockAgentRunService.completeRun).not.toHaveBeenCalled();
  });
});

describe('GET /api/agent/run', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const response = await GET(makeGetRequest());
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockAgentRunService.listRuns).not.toHaveBeenCalled();
  });

  it('should return list of runs for authenticated user', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const runs = [
      {
        id: 'run-1',
        userId: MOCK_USER.id,
        query: 'What is AI?',
        agentType: 'research',
        status: 'completed',
        output: 'AI is...',
        steps: [],
        toolCalls: [],
        createdAt: '2026-02-23T10:00:00Z',
      },
      {
        id: 'run-2',
        userId: MOCK_USER.id,
        query: 'Sort an array',
        agentType: 'code',
        status: 'completed',
        output: 'Here is a sort...',
        steps: [],
        toolCalls: [],
        createdAt: '2026-02-23T11:00:00Z',
      },
    ];
    mockAgentRunService.listRuns.mockResolvedValue(runs);

    const response = await GET(makeGetRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.runs).toHaveLength(2);
    expect(data.runs[0].id).toBe('run-1');
    expect(data.runs[1].id).toBe('run-2');

    expect(mockAgentRunService.listRuns).toHaveBeenCalledWith(
      MOCK_USER.id,
      expect.objectContaining({})
    );
  });

  it('should support limit query param', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockAgentRunService.listRuns.mockResolvedValue([]);

    await GET(makeGetRequest('limit=10'));

    expect(mockAgentRunService.listRuns).toHaveBeenCalledWith(
      MOCK_USER.id,
      expect.objectContaining({ limit: 10 })
    );
  });

  it('should support agentType query param', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockAgentRunService.listRuns.mockResolvedValue([]);

    await GET(makeGetRequest('agentType=code'));

    expect(mockAgentRunService.listRuns).toHaveBeenCalledWith(
      MOCK_USER.id,
      expect.objectContaining({ agentType: 'code' })
    );
  });

  it('should support both limit and agentType query params', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockAgentRunService.listRuns.mockResolvedValue([]);

    await GET(makeGetRequest('limit=5&agentType=research'));

    expect(mockAgentRunService.listRuns).toHaveBeenCalledWith(
      MOCK_USER.id,
      expect.objectContaining({ limit: 5, agentType: 'research' })
    );
  });

  it('should return empty runs array when user has no runs', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockAgentRunService.listRuns.mockResolvedValue([]);

    const response = await GET(makeGetRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.runs).toEqual([]);
  });
});
