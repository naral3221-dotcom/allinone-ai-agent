import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGetAuthenticatedUser } = vi.hoisted(() => ({
  mockGetAuthenticatedUser: vi.fn(),
}));
vi.mock('@/lib/auth/get-user', () => ({
  getAuthenticatedUser: mockGetAuthenticatedUser,
}));

const { mockAgentRunService } = vi.hoisted(() => ({
  mockAgentRunService: {
    getRun: vi.fn(),
  },
}));
vi.mock('@/lib/db/agent-run.service.singleton', () => ({
  agentRunService: mockAgentRunService,
}));

import { GET } from './route';

const MOCK_USER = { id: 'user-1', clerkId: 'clerk-abc', email: 'test@example.com' };

function makeGetRequest(id: string): Request {
  return new Request(`http://localhost/api/agent/run/${id}`, { method: 'GET' });
}

describe('GET /api/agent/run/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const response = await GET(makeGetRequest('run-1'), { params: Promise.resolve({ id: 'run-1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return run details for authenticated user', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const run = {
      id: 'run-1',
      userId: MOCK_USER.id,
      agentType: 'research',
      status: 'completed',
      input: 'What is AI?',
      output: 'AI is...',
      steps: [{ id: 'step-1', agentType: 'research', action: 'search', input: 'AI', output: 'results', timestamp: 1700000000 }],
      toolCalls: [],
      model: 'claude-sonnet',
      duration: 3000,
      createdAt: '2026-02-23T10:00:00Z',
      updatedAt: '2026-02-23T10:00:03Z',
    };
    mockAgentRunService.getRun.mockResolvedValue(run);

    const response = await GET(makeGetRequest('run-1'), { params: Promise.resolve({ id: 'run-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.run.id).toBe('run-1');
    expect(data.run.agentType).toBe('research');
    expect(data.run.steps).toHaveLength(1);
    expect(mockAgentRunService.getRun).toHaveBeenCalledWith('run-1');
  });

  it('should return 404 for non-existent run', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockAgentRunService.getRun.mockResolvedValue(null);

    const response = await GET(makeGetRequest('non-existent'), { params: Promise.resolve({ id: 'non-existent' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toMatch(/not found/i);
  });

  it('should return 403 if run belongs to different user', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const run = {
      id: 'run-other',
      userId: 'other-user',
      agentType: 'code',
      status: 'completed',
    };
    mockAgentRunService.getRun.mockResolvedValue(run);

    const response = await GET(makeGetRequest('run-other'), { params: Promise.resolve({ id: 'run-other' }) });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toMatch(/forbidden/i);
  });
});
