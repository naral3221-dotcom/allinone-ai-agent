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
    createKnowledgeBase: vi.fn(),
    listKnowledgeBases: vi.fn(),
  },
}));
vi.mock('@/lib/db/knowledge.service.singleton', () => ({
  knowledgeBaseService: mockKnowledgeBaseService,
}));

// ---------------------------------------------------------------------------
// System under test
// ---------------------------------------------------------------------------

import { POST, GET } from './route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePostRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost/api/knowledge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeGetRequest(): Request {
  return new Request('http://localhost/api/knowledge', { method: 'GET' });
}

const MOCK_USER = { id: 'user-1', email: 'test@example.com' };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/knowledge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const response = await POST(makePostRequest({ name: 'My KB' }));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockKnowledgeBaseService.createKnowledgeBase).not.toHaveBeenCalled();
  });

  it('should return 400 if name is missing', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const response = await POST(makePostRequest({}));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/name/i);
    expect(mockKnowledgeBaseService.createKnowledgeBase).not.toHaveBeenCalled();
  });

  it('should return 400 if name is empty string', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const response = await POST(makePostRequest({ name: '  ' }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/name/i);
    expect(mockKnowledgeBaseService.createKnowledgeBase).not.toHaveBeenCalled();
  });

  it('should create knowledge base and return it', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const createdKB = {
      id: 'kb-1',
      userId: MOCK_USER.id,
      name: 'Research Notes',
      description: 'My research notes',
      createdAt: '2026-02-23T10:00:00Z',
      updatedAt: '2026-02-23T10:00:00Z',
    };
    mockKnowledgeBaseService.createKnowledgeBase.mockResolvedValue(createdKB);

    const response = await POST(
      makePostRequest({ name: 'Research Notes', description: 'My research notes' })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.knowledgeBase).toEqual(createdKB);

    expect(mockKnowledgeBaseService.createKnowledgeBase).toHaveBeenCalledWith(
      MOCK_USER.id,
      'Research Notes',
      'My research notes'
    );
  });
});

describe('GET /api/knowledge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const response = await GET(makeGetRequest());
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockKnowledgeBaseService.listKnowledgeBases).not.toHaveBeenCalled();
  });

  it('should return list of knowledge bases', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const knowledgeBases = [
      {
        id: 'kb-1',
        userId: MOCK_USER.id,
        name: 'Research Notes',
        description: null,
        createdAt: '2026-02-23T10:00:00Z',
        updatedAt: '2026-02-23T10:00:00Z',
      },
      {
        id: 'kb-2',
        userId: MOCK_USER.id,
        name: 'Project Docs',
        description: 'Project documentation',
        createdAt: '2026-02-23T11:00:00Z',
        updatedAt: '2026-02-23T11:00:00Z',
      },
    ];
    mockKnowledgeBaseService.listKnowledgeBases.mockResolvedValue(knowledgeBases);

    const response = await GET(makeGetRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.knowledgeBases).toHaveLength(2);
    expect(data.knowledgeBases[0].id).toBe('kb-1');
    expect(data.knowledgeBases[1].id).toBe('kb-2');

    expect(mockKnowledgeBaseService.listKnowledgeBases).toHaveBeenCalledWith(MOCK_USER.id);
  });

  it('should return empty array when user has no knowledge bases', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockKnowledgeBaseService.listKnowledgeBases.mockResolvedValue([]);

    const response = await GET(makeGetRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.knowledgeBases).toEqual([]);
  });
});
