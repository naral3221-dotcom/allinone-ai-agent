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

const { mockDocumentService } = vi.hoisted(() => ({
  mockDocumentService: {
    create: vi.fn(),
    list: vi.fn(),
  },
}));
vi.mock('@/lib/db/document.service.singleton', () => ({
  documentService: mockDocumentService,
}));

// ---------------------------------------------------------------------------
// System under test
// ---------------------------------------------------------------------------

import { POST, GET } from './route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePostRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost/api/documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeGetRequest(queryParams?: string): Request {
  const url = queryParams
    ? `http://localhost/api/documents?${queryParams}`
    : 'http://localhost/api/documents';
  return new Request(url, { method: 'GET' });
}

const MOCK_USER = { id: 'user-1', email: 'test@example.com' };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/documents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const response = await POST(makePostRequest({ title: 'Doc', content: {} }));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockDocumentService.create).not.toHaveBeenCalled();
  });

  it('should return 400 if title is missing', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const response = await POST(makePostRequest({ content: {} }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/title/i);
    expect(mockDocumentService.create).not.toHaveBeenCalled();
  });

  it('should create document and return it', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const createdDoc = {
      id: 'doc-1',
      userId: MOCK_USER.id,
      title: 'My Document',
      content: { type: 'doc', content: [] },
      type: 'document',
      tags: [],
      createdAt: '2026-02-23T10:00:00Z',
      updatedAt: '2026-02-23T10:00:00Z',
    };
    mockDocumentService.create.mockResolvedValue(createdDoc);

    const response = await POST(
      makePostRequest({
        title: 'My Document',
        content: { type: 'doc', content: [] },
        type: 'document',
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.document).toEqual(createdDoc);
    expect(mockDocumentService.create).toHaveBeenCalledWith({
      userId: MOCK_USER.id,
      title: 'My Document',
      content: { type: 'doc', content: [] },
      type: 'document',
    });
  });
});

describe('GET /api/documents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const response = await GET(makeGetRequest());
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockDocumentService.list).not.toHaveBeenCalled();
  });

  it('should return list of documents', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const documents = [
      { id: 'doc-1', title: 'First', type: 'document' },
      { id: 'doc-2', title: 'Second', type: 'note' },
    ];
    mockDocumentService.list.mockResolvedValue(documents);

    const response = await GET(makeGetRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.documents).toHaveLength(2);
    expect(mockDocumentService.list).toHaveBeenCalledWith(MOCK_USER.id, {});
  });

  it('should filter documents by type', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const documents = [{ id: 'doc-1', title: 'Note', type: 'note' }];
    mockDocumentService.list.mockResolvedValue(documents);

    const response = await GET(makeGetRequest('type=note'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.documents).toHaveLength(1);
    expect(mockDocumentService.list).toHaveBeenCalledWith(MOCK_USER.id, { type: 'note' });
  });
});
