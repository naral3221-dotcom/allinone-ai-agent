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

const { mockRAGPipeline } = vi.hoisted(() => ({
  mockRAGPipeline: {
    query: vi.fn(),
  },
}));
vi.mock('@/lib/rag/pipeline', () => {
  function MockRAGPipeline() {
    return mockRAGPipeline;
  }
  return { RAGPipeline: MockRAGPipeline };
});

// ---------------------------------------------------------------------------
// System under test
// ---------------------------------------------------------------------------

import { POST } from './route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePostRequest(id: string, body: Record<string, unknown>): Request {
  return new Request(`http://localhost/api/knowledge/${id}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const MOCK_USER = { id: 'user-1', email: 'test@example.com' };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/knowledge/[id]/search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const params = Promise.resolve({ id: 'kb-1' });
    const response = await POST(
      makePostRequest('kb-1', { query: 'What is AI?' }),
      { params }
    );
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockRAGPipeline.query).not.toHaveBeenCalled();
  });

  it('should return 400 if query is missing', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const params = Promise.resolve({ id: 'kb-1' });
    const response = await POST(
      makePostRequest('kb-1', {}),
      { params }
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/query/i);
    expect(mockRAGPipeline.query).not.toHaveBeenCalled();
  });

  it('should return 400 if query is empty string', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const params = Promise.resolve({ id: 'kb-1' });
    const response = await POST(
      makePostRequest('kb-1', { query: '   ' }),
      { params }
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/query/i);
    expect(mockRAGPipeline.query).not.toHaveBeenCalled();
  });

  it('should return RAG search results with answer, sources, and contexts', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const ragResult = {
      answer: 'AI stands for Artificial Intelligence...',
      sources: [
        { title: 'AI Overview [1/2]', similarity: 0.95 },
        { title: 'AI Overview [2/2]', similarity: 0.87 },
      ],
      contexts: [
        {
          id: 'ctx-1',
          title: 'AI Overview [1/2]',
          content: 'Artificial Intelligence is...',
          similarity: 0.95,
        },
        {
          id: 'ctx-2',
          title: 'AI Overview [2/2]',
          content: 'Machine learning is a subset...',
          similarity: 0.87,
        },
      ],
    };
    mockRAGPipeline.query.mockResolvedValue(ragResult);

    const params = Promise.resolve({ id: 'kb-1' });
    const response = await POST(
      makePostRequest('kb-1', { query: 'What is AI?', topK: 5, modelId: 'claude-sonnet' }),
      { params }
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.answer).toBe('AI stands for Artificial Intelligence...');
    expect(data.sources).toHaveLength(2);
    expect(data.sources[0].title).toBe('AI Overview [1/2]');
    expect(data.sources[0].similarity).toBe(0.95);
    expect(data.contexts).toHaveLength(2);

    expect(mockRAGPipeline.query).toHaveBeenCalledWith({
      query: 'What is AI?',
      knowledgeBaseId: 'kb-1',
      topK: 5,
      modelId: 'claude-sonnet',
    });
  });

  it('should pass optional parameters to RAG pipeline', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockRAGPipeline.query.mockResolvedValue({
      answer: 'Answer',
      sources: [],
      contexts: [],
    });

    const params = Promise.resolve({ id: 'kb-2' });
    await POST(
      makePostRequest('kb-2', { query: 'Search term' }),
      { params }
    );

    expect(mockRAGPipeline.query).toHaveBeenCalledWith({
      query: 'Search term',
      knowledgeBaseId: 'kb-2',
      topK: undefined,
      modelId: undefined,
    });
  });
});
