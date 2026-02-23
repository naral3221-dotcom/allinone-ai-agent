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
    create: vi.fn(),
    list: vi.fn(),
  },
}));
vi.mock('@/lib/db/workflow.service.singleton', () => ({
  workflowService: mockWorkflowService,
}));

// ---------------------------------------------------------------------------
// System under test
// ---------------------------------------------------------------------------

import { POST, GET } from './route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePostRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost/api/workflows', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeGetRequest(): Request {
  return new Request('http://localhost/api/workflows', { method: 'GET' });
}

const MOCK_USER = { id: 'user-1', clerkId: 'clerk-abc', email: 'test@example.com' };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const response = await POST(makePostRequest({ name: 'Test', steps: [] }));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockWorkflowService.create).not.toHaveBeenCalled();
  });

  it('should return 400 if name is missing', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const response = await POST(makePostRequest({ steps: [] }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/name.*required|required/i);
  });

  it('should return 400 if steps is missing or not an array', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const response = await POST(makePostRequest({ name: 'Test' }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/steps.*required|required/i);
  });

  it('should create a workflow and return it', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const createdWorkflow = {
      id: 'wf-1',
      userId: MOCK_USER.id,
      name: 'Research Pipeline',
      description: 'A research pipeline',
      isActive: true,
      steps: [
        { id: 'step-1', order: 0, agentType: 'research', prompt: 'Find info' },
      ],
    };
    mockWorkflowService.create.mockResolvedValue(createdWorkflow);

    const response = await POST(
      makePostRequest({
        name: 'Research Pipeline',
        description: 'A research pipeline',
        steps: [
          { order: 0, agentType: 'research', prompt: 'Find info' },
        ],
      })
    );
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.workflow).toEqual(createdWorkflow);
    expect(mockWorkflowService.create).toHaveBeenCalledWith({
      userId: MOCK_USER.id,
      name: 'Research Pipeline',
      description: 'A research pipeline',
      steps: [
        { order: 0, agentType: 'research', prompt: 'Find info' },
      ],
    });
  });
});

describe('GET /api/workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const response = await GET(makeGetRequest());
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockWorkflowService.list).not.toHaveBeenCalled();
  });

  it('should list workflows for authenticated user', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const workflows = [
      { id: 'wf-1', name: 'Pipeline A', isActive: true, steps: [] },
      { id: 'wf-2', name: 'Pipeline B', isActive: true, steps: [] },
    ];
    mockWorkflowService.list.mockResolvedValue(workflows);

    const response = await GET(makeGetRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.workflows).toHaveLength(2);
    expect(mockWorkflowService.list).toHaveBeenCalledWith(MOCK_USER.id);
  });
});
