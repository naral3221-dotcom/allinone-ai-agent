import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MODEL_REGISTRY } from '@/lib/ai/models';

// Hoisted mocks for the POST handler tests
const { mockStreamText, mockGetAuthenticatedUser, mockConversationService, mockRAGPipeline } = vi.hoisted(() => ({
  mockStreamText: vi.fn(),
  mockGetAuthenticatedUser: vi.fn(),
  mockConversationService: {
    addMessage: vi.fn(),
    getConversation: vi.fn(),
    updateConversationTitle: vi.fn(),
    logUsage: vi.fn(),
  },
  mockRAGPipeline: {
    retrieveContext: vi.fn(),
  },
}));

vi.mock('ai', () => ({
  streamText: mockStreamText,
}));

vi.mock('@/lib/ai/providers', () => ({
  models: {
    'claude-sonnet': { id: 'claude-sonnet-mock' },
  },
}));

vi.mock('@/lib/auth/get-user', () => ({
  getAuthenticatedUser: mockGetAuthenticatedUser,
}));

vi.mock('@/lib/db', () => ({
  conversationService: mockConversationService,
}));

vi.mock('@/lib/rag/pipeline', () => ({
  RAGPipeline: class {
    retrieveContext = mockRAGPipeline.retrieveContext;
  },
}));

describe('Chat API route logic', () => {
  it('should reject invalid model id', () => {
    const modelInfo = MODEL_REGISTRY['nonexistent' as keyof typeof MODEL_REGISTRY];
    expect(modelInfo).toBeUndefined();
  });

  it('should accept valid model id', () => {
    const modelInfo = MODEL_REGISTRY['claude-sonnet'];
    expect(modelInfo).toBeDefined();
    expect(modelInfo.provider).toBe('anthropic');
  });

  it('should calculate cost correctly', () => {
    const modelInfo = MODEL_REGISTRY['claude-sonnet'];
    const inputTokens = 1000;
    const outputTokens = 500;

    const cost =
      (inputTokens / 1000) * modelInfo.costPer1kInput +
      (outputTokens / 1000) * modelInfo.costPer1kOutput;

    expect(cost).toBe(0.003 + 0.0075);
  });

  it('should truncate title to 50 chars', () => {
    const longContent = 'A'.repeat(100);
    const title =
      longContent.slice(0, 50) + (longContent.length > 50 ? '...' : '');
    expect(title).toBe('A'.repeat(50) + '...');
  });

  it('should not add ellipsis for short title', () => {
    const shortContent = 'Hello';
    const title =
      shortContent.slice(0, 50) + (shortContent.length > 50 ? '...' : '');
    expect(title).toBe('Hello');
  });
});

describe('Chat API POST handler - RAG integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthenticatedUser.mockResolvedValue({ id: 'user-1', email: 'test@test.com' });
    mockStreamText.mockReturnValue({
      toTextStreamResponse: () => new Response('stream', { status: 200 }),
    });
  });

  function makeRequest(body: Record<string, unknown>) {
    return new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('should call RAG retrieveContext when knowledgeBaseId is provided', async () => {
    const { POST } = await import('./route');

    mockRAGPipeline.retrieveContext.mockResolvedValue([
      { id: 'doc-1', title: 'Doc 1', content: 'Some relevant context', similarity: 0.9 },
    ]);

    const request = makeRequest({
      messages: [{ role: 'user', content: 'What is the policy?' }],
      modelId: 'claude-sonnet',
      knowledgeBaseId: 'kb-123',
    });

    await POST(request);

    expect(mockRAGPipeline.retrieveContext).toHaveBeenCalledWith({
      query: 'What is the policy?',
      knowledgeBaseId: 'kb-123',
    });
  });

  it('should include retrieved context in system message passed to streamText', async () => {
    const { POST } = await import('./route');

    mockRAGPipeline.retrieveContext.mockResolvedValue([
      { id: 'doc-1', title: 'Doc 1', content: 'Context chunk A', similarity: 0.95 },
      { id: 'doc-2', title: 'Doc 2', content: 'Context chunk B', similarity: 0.85 },
    ]);

    const request = makeRequest({
      messages: [{ role: 'user', content: 'Explain the architecture' }],
      modelId: 'claude-sonnet',
      knowledgeBaseId: 'kb-456',
    });

    await POST(request);

    expect(mockStreamText).toHaveBeenCalledTimes(1);
    const callArgs = mockStreamText.mock.calls[0][0];
    expect(callArgs.system).toBeDefined();
    expect(callArgs.system).toContain('Context chunk A');
    expect(callArgs.system).toContain('Context chunk B');
    expect(callArgs.system).toContain('Use the following context');
  });

  it('should work normally without knowledgeBaseId (no RAG call)', async () => {
    const { POST } = await import('./route');

    const request = makeRequest({
      messages: [{ role: 'user', content: 'Hello' }],
      modelId: 'claude-sonnet',
    });

    await POST(request);

    expect(mockRAGPipeline.retrieveContext).not.toHaveBeenCalled();
    expect(mockStreamText).toHaveBeenCalledTimes(1);
    const callArgs = mockStreamText.mock.calls[0][0];
    expect(callArgs.system).toBeUndefined();
  });

  it('should not set system prompt when RAG returns empty contexts', async () => {
    const { POST } = await import('./route');

    mockRAGPipeline.retrieveContext.mockResolvedValue([]);

    const request = makeRequest({
      messages: [{ role: 'user', content: 'Random question' }],
      modelId: 'claude-sonnet',
      knowledgeBaseId: 'kb-789',
    });

    await POST(request);

    expect(mockRAGPipeline.retrieveContext).toHaveBeenCalled();
    const callArgs = mockStreamText.mock.calls[0][0];
    expect(callArgs.system).toBeUndefined();
  });
});
