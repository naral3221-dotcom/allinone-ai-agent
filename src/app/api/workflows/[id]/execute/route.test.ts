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

const { mockWorkflowService } = vi.hoisted(() => ({
  mockWorkflowService: {
    get: vi.fn(),
  },
}));
vi.mock('@/lib/db/workflow.service.singleton', () => ({
  workflowService: mockWorkflowService,
}));

const { mockWorkflowEngine } = vi.hoisted(() => ({
  mockWorkflowEngine: {
    execute: vi.fn(),
  },
}));
vi.mock('@/lib/workflow', () => ({
  workflowEngine: mockWorkflowEngine,
}));

// ---------------------------------------------------------------------------
// System under test
// ---------------------------------------------------------------------------

import { POST } from './route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePostRequest(id: string): Request {
  return new Request(`http://localhost/api/workflows/${id}/execute`, {
    method: 'POST',
  });
}

const MOCK_USER = { id: 'user-1', email: 'test@example.com' };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/workflows/[id]/execute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const params = Promise.resolve({ id: 'wf-1' });
    const response = await POST(makePostRequest('wf-1'), { params });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockWorkflowService.get).not.toHaveBeenCalled();
    expect(mockWorkflowEngine.execute).not.toHaveBeenCalled();
  });

  it('should return 404 if workflow not found', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockWorkflowService.get.mockResolvedValue(null);

    const params = Promise.resolve({ id: 'non-existent' });
    const response = await POST(makePostRequest('non-existent'), { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toMatch(/not found/i);
    expect(mockWorkflowEngine.execute).not.toHaveBeenCalled();
  });

  it('should execute workflow and return result', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const workflow = {
      id: 'wf-1',
      userId: MOCK_USER.id,
      name: 'Research Pipeline',
      steps: [
        { id: 'step-1', order: 0, agentType: 'research', prompt: 'Find info about AI' },
        { id: 'step-2', order: 1, agentType: 'content', prompt: 'Summarize findings' },
      ],
    };
    mockWorkflowService.get.mockResolvedValue(workflow);

    const executionResult = {
      steps: [
        {
          stepId: 'step-1',
          agentType: 'research',
          input: 'Find info about AI',
          output: 'AI research results',
          duration: 1200,
          status: 'success',
        },
        {
          stepId: 'step-2',
          agentType: 'content',
          input: 'Summarize findings',
          output: 'Summary of AI research',
          duration: 800,
          status: 'success',
        },
      ],
      finalOutput: 'Summary of AI research',
      totalDuration: 2000,
      status: 'completed',
    };
    mockWorkflowEngine.execute.mockResolvedValue(executionResult);

    const params = Promise.resolve({ id: 'wf-1' });
    const response = await POST(makePostRequest('wf-1'), { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.result).toEqual(executionResult);
    expect(mockWorkflowService.get).toHaveBeenCalledWith('wf-1');
    expect(mockWorkflowEngine.execute).toHaveBeenCalledWith({
      steps: workflow.steps.map((s) => ({
        id: s.id,
        order: s.order,
        agentType: s.agentType,
        prompt: s.prompt,
        config: undefined,
      })),
    });
  });
});
