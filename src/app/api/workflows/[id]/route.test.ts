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
    delete: vi.fn(),
  },
}));
vi.mock('@/lib/db/workflow.service.singleton', () => ({
  workflowService: mockWorkflowService,
}));

// ---------------------------------------------------------------------------
// System under test
// ---------------------------------------------------------------------------

import { GET, DELETE } from './route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeGetRequest(id: string): Request {
  return new Request(`http://localhost/api/workflows/${id}`, { method: 'GET' });
}

function makeDeleteRequest(id: string): Request {
  return new Request(`http://localhost/api/workflows/${id}`, { method: 'DELETE' });
}

const MOCK_USER = { id: 'user-1', clerkId: 'clerk-abc', email: 'test@example.com' };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/workflows/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const params = Promise.resolve({ id: 'wf-1' });
    const response = await GET(makeGetRequest('wf-1'), { params });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockWorkflowService.get).not.toHaveBeenCalled();
  });

  it('should return workflow by id', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const workflow = {
      id: 'wf-1',
      userId: MOCK_USER.id,
      name: 'Pipeline A',
      steps: [
        { id: 'step-1', order: 0, agentType: 'research', prompt: 'Find info' },
      ],
    };
    mockWorkflowService.get.mockResolvedValue(workflow);

    const params = Promise.resolve({ id: 'wf-1' });
    const response = await GET(makeGetRequest('wf-1'), { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.workflow).toEqual(workflow);
    expect(mockWorkflowService.get).toHaveBeenCalledWith('wf-1');
  });

  it('should return 404 if workflow not found', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockWorkflowService.get.mockResolvedValue(null);

    const params = Promise.resolve({ id: 'non-existent' });
    const response = await GET(makeGetRequest('non-existent'), { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toMatch(/not found/i);
  });
});

describe('DELETE /api/workflows/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const params = Promise.resolve({ id: 'wf-1' });
    const response = await DELETE(makeDeleteRequest('wf-1'), { params });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockWorkflowService.delete).not.toHaveBeenCalled();
  });

  it('should delete workflow and return success', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockWorkflowService.delete.mockResolvedValue(undefined);

    const params = Promise.resolve({ id: 'wf-1' });
    const response = await DELETE(makeDeleteRequest('wf-1'), { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockWorkflowService.delete).toHaveBeenCalledWith('wf-1');
  });
});
