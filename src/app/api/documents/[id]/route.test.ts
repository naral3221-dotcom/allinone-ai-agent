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
    get: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));
vi.mock('@/lib/db/document.service.singleton', () => ({
  documentService: mockDocumentService,
}));

// ---------------------------------------------------------------------------
// System under test
// ---------------------------------------------------------------------------

import { GET, PUT, DELETE } from './route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeGetRequest(id: string): Request {
  return new Request(`http://localhost/api/documents/${id}`, { method: 'GET' });
}

function makePutRequest(id: string, body: Record<string, unknown>): Request {
  return new Request(`http://localhost/api/documents/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeDeleteRequest(id: string): Request {
  return new Request(`http://localhost/api/documents/${id}`, { method: 'DELETE' });
}

const MOCK_USER = { id: 'user-1', email: 'test@example.com' };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/documents/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const params = Promise.resolve({ id: 'doc-1' });
    const response = await GET(makeGetRequest('doc-1'), { params });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockDocumentService.get).not.toHaveBeenCalled();
  });

  it('should return document details', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const doc = {
      id: 'doc-1',
      userId: MOCK_USER.id,
      title: 'My Document',
      content: { type: 'doc', content: [] },
      type: 'document',
      tags: ['important'],
    };
    mockDocumentService.get.mockResolvedValue(doc);

    const params = Promise.resolve({ id: 'doc-1' });
    const response = await GET(makeGetRequest('doc-1'), { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.document.id).toBe('doc-1');
    expect(data.document.title).toBe('My Document');
    expect(mockDocumentService.get).toHaveBeenCalledWith('doc-1');
  });

  it('should return 404 if document not found', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockDocumentService.get.mockResolvedValue(null);

    const params = Promise.resolve({ id: 'non-existent' });
    const response = await GET(makeGetRequest('non-existent'), { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toMatch(/not found/i);
  });
});

describe('PUT /api/documents/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const params = Promise.resolve({ id: 'doc-1' });
    const response = await PUT(
      makePutRequest('doc-1', { title: 'Updated' }),
      { params }
    );
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockDocumentService.update).not.toHaveBeenCalled();
  });

  it('should update document and return updated version', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const updated = {
      id: 'doc-1',
      title: 'Updated Title',
      content: { type: 'doc', content: [{ type: 'paragraph' }] },
      tags: ['reviewed'],
    };
    mockDocumentService.update.mockResolvedValue(updated);

    const params = Promise.resolve({ id: 'doc-1' });
    const response = await PUT(
      makePutRequest('doc-1', {
        title: 'Updated Title',
        content: { type: 'doc', content: [{ type: 'paragraph' }] },
      }),
      { params }
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.document).toEqual(updated);
    expect(mockDocumentService.update).toHaveBeenCalledWith('doc-1', {
      title: 'Updated Title',
      content: { type: 'doc', content: [{ type: 'paragraph' }] },
    });
  });
});

describe('DELETE /api/documents/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const params = Promise.resolve({ id: 'doc-1' });
    const response = await DELETE(makeDeleteRequest('doc-1'), { params });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockDocumentService.delete).not.toHaveBeenCalled();
  });

  it('should delete document and return success', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockDocumentService.delete.mockResolvedValue(undefined);

    const params = Promise.resolve({ id: 'doc-1' });
    const response = await DELETE(makeDeleteRequest('doc-1'), { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDocumentService.delete).toHaveBeenCalledWith('doc-1');
  });
});
