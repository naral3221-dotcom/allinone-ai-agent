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

const { mockAssistService } = vi.hoisted(() => ({
  mockAssistService: { assist: vi.fn() },
}));
vi.mock('@/lib/ai/assist', () => ({
  AIAssistService: class {
    assist = mockAssistService.assist;
  },
}));

// ---------------------------------------------------------------------------
// System under test
// ---------------------------------------------------------------------------

import { POST } from './route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePostRequest(id: string, body: Record<string, unknown>): Request {
  return new Request(`http://localhost/api/documents/${id}/ai-assist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const MOCK_USER = { id: 'user-1', clerkId: 'clerk-abc', email: 'test@example.com' };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/documents/[id]/ai-assist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const params = Promise.resolve({ id: 'doc-1' });
    const response = await POST(
      makePostRequest('doc-1', { text: 'Hello', action: 'improve' }),
      { params }
    );
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockAssistService.assist).not.toHaveBeenCalled();
  });

  it('should return 400 if text is missing', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const params = Promise.resolve({ id: 'doc-1' });
    const response = await POST(
      makePostRequest('doc-1', { action: 'improve' }),
      { params }
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/text/i);
    expect(mockAssistService.assist).not.toHaveBeenCalled();
  });

  it('should return 400 if action is missing', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const params = Promise.resolve({ id: 'doc-1' });
    const response = await POST(
      makePostRequest('doc-1', { text: 'Hello world' }),
      { params }
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/action/i);
    expect(mockAssistService.assist).not.toHaveBeenCalled();
  });

  it('should return AI-assisted result', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockAssistService.assist.mockResolvedValue({ result: 'Improved text here.' });

    const params = Promise.resolve({ id: 'doc-1' });
    const response = await POST(
      makePostRequest('doc-1', { text: 'Original text', action: 'improve' }),
      { params }
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.result).toBe('Improved text here.');
    expect(mockAssistService.assist).toHaveBeenCalledWith({
      text: 'Original text',
      action: 'improve',
      options: {},
    });
  });

  it('should pass options (language, tone) through to assist service', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockAssistService.assist.mockResolvedValue({ result: 'Translated text.' });

    const params = Promise.resolve({ id: 'doc-1' });
    const response = await POST(
      makePostRequest('doc-1', {
        text: 'Hello world',
        action: 'translate',
        options: { language: 'Korean' },
      }),
      { params }
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.result).toBe('Translated text.');
    expect(mockAssistService.assist).toHaveBeenCalledWith({
      text: 'Hello world',
      action: 'translate',
      options: { language: 'Korean' },
    });
  });
});
