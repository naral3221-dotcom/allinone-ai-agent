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

const { mockKnowledgeBaseService } = vi.hoisted(() => ({
  mockKnowledgeBaseService: {
    getKnowledgeBase: vi.fn(),
    deleteKnowledgeBase: vi.fn(),
  },
}));
vi.mock('@/lib/db/knowledge.service.singleton', () => ({
  knowledgeBaseService: mockKnowledgeBaseService,
}));

// ---------------------------------------------------------------------------
// System under test
// ---------------------------------------------------------------------------

import { GET, DELETE } from './route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeGetRequest(id: string): Request {
  return new Request(`http://localhost/api/knowledge/${id}`, { method: 'GET' });
}

function makeDeleteRequest(id: string): Request {
  return new Request(`http://localhost/api/knowledge/${id}`, { method: 'DELETE' });
}

const MOCK_USER = { id: 'user-1', email: 'test@example.com' };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/knowledge/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const params = Promise.resolve({ id: 'kb-1' });
    const response = await GET(makeGetRequest('kb-1'), { params });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockKnowledgeBaseService.getKnowledgeBase).not.toHaveBeenCalled();
  });

  it('should return knowledge base details', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const kb = {
      id: 'kb-1',
      userId: MOCK_USER.id,
      name: 'Research Notes',
      description: 'My research notes',
      entries: [
        {
          id: 'entry-1',
          title: 'AI Overview',
          content: 'AI is...',
          sourceType: 'text',
        },
      ],
      createdAt: '2026-02-23T10:00:00Z',
      updatedAt: '2026-02-23T10:00:00Z',
    };
    mockKnowledgeBaseService.getKnowledgeBase.mockResolvedValue(kb);

    const params = Promise.resolve({ id: 'kb-1' });
    const response = await GET(makeGetRequest('kb-1'), { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.knowledgeBase.id).toBe('kb-1');
    expect(data.knowledgeBase.name).toBe('Research Notes');
    expect(data.knowledgeBase.entries).toHaveLength(1);
    expect(mockKnowledgeBaseService.getKnowledgeBase).toHaveBeenCalledWith('kb-1');
  });

  it('should return 404 if knowledge base not found', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockKnowledgeBaseService.getKnowledgeBase.mockResolvedValue(null);

    const params = Promise.resolve({ id: 'non-existent' });
    const response = await GET(makeGetRequest('non-existent'), { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toMatch(/not found/i);
  });
});

describe('DELETE /api/knowledge/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const params = Promise.resolve({ id: 'kb-1' });
    const response = await DELETE(makeDeleteRequest('kb-1'), { params });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockKnowledgeBaseService.deleteKnowledgeBase).not.toHaveBeenCalled();
  });

  it('should delete knowledge base and return success', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockKnowledgeBaseService.deleteKnowledgeBase.mockResolvedValue(undefined);

    const params = Promise.resolve({ id: 'kb-1' });
    const response = await DELETE(makeDeleteRequest('kb-1'), { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockKnowledgeBaseService.deleteKnowledgeBase).toHaveBeenCalledWith('kb-1');
  });
});
