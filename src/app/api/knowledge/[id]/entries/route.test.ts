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
    addEntry: vi.fn(),
  },
}));
vi.mock('@/lib/db/knowledge.service.singleton', () => ({
  knowledgeBaseService: mockKnowledgeBaseService,
}));

// ---------------------------------------------------------------------------
// System under test
// ---------------------------------------------------------------------------

import { POST } from './route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePostRequest(id: string, body: Record<string, unknown>): Request {
  return new Request(`http://localhost/api/knowledge/${id}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const MOCK_USER = { id: 'user-1', clerkId: 'clerk-abc', email: 'test@example.com' };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/knowledge/[id]/entries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const params = Promise.resolve({ id: 'kb-1' });
    const response = await POST(
      makePostRequest('kb-1', { title: 'Test', content: 'Content' }),
      { params }
    );
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockKnowledgeBaseService.addEntry).not.toHaveBeenCalled();
  });

  it('should return 400 if title is missing', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const params = Promise.resolve({ id: 'kb-1' });
    const response = await POST(
      makePostRequest('kb-1', { content: 'Some content' }),
      { params }
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/title.*content/i);
    expect(mockKnowledgeBaseService.addEntry).not.toHaveBeenCalled();
  });

  it('should return 400 if content is missing', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const params = Promise.resolve({ id: 'kb-1' });
    const response = await POST(
      makePostRequest('kb-1', { title: 'My Title' }),
      { params }
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/title.*content/i);
    expect(mockKnowledgeBaseService.addEntry).not.toHaveBeenCalled();
  });

  it('should add entry and return chunksCreated count', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockKnowledgeBaseService.addEntry.mockResolvedValue({ chunksCreated: 3 });

    const params = Promise.resolve({ id: 'kb-1' });
    const response = await POST(
      makePostRequest('kb-1', {
        title: 'AI Research',
        content: 'Long article about AI...',
        sourceType: 'article',
        sourceUrl: 'https://example.com/ai',
      }),
      { params }
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.chunksCreated).toBe(3);

    expect(mockKnowledgeBaseService.addEntry).toHaveBeenCalledWith({
      knowledgeBaseId: 'kb-1',
      title: 'AI Research',
      content: 'Long article about AI...',
      sourceType: 'article',
      sourceUrl: 'https://example.com/ai',
    });
  });

  it('should use default sourceType "text" when not provided', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockKnowledgeBaseService.addEntry.mockResolvedValue({ chunksCreated: 1 });

    const params = Promise.resolve({ id: 'kb-1' });
    await POST(
      makePostRequest('kb-1', { title: 'Note', content: 'Simple note' }),
      { params }
    );

    expect(mockKnowledgeBaseService.addEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceType: 'text',
      })
    );
  });
});
