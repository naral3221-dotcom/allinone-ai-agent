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

const { mockPromptTemplateService } = vi.hoisted(() => ({
  mockPromptTemplateService: {
    get: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));
vi.mock('@/lib/db/prompt-template.service.singleton', () => ({
  promptTemplateService: mockPromptTemplateService,
}));

// ---------------------------------------------------------------------------
// System under test
// ---------------------------------------------------------------------------

import { GET, PUT, DELETE } from './route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeGetRequest(id: string): Request {
  return new Request(`http://localhost/api/templates/${id}`, { method: 'GET' });
}

function makePutRequest(id: string, body: Record<string, unknown>): Request {
  return new Request(`http://localhost/api/templates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeDeleteRequest(id: string): Request {
  return new Request(`http://localhost/api/templates/${id}`, { method: 'DELETE' });
}

const MOCK_USER = { id: 'user-1', email: 'test@example.com' };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/templates/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return template by id', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const template = {
      id: 'tmpl-1',
      userId: MOCK_USER.id,
      name: 'My Template',
      content: 'Hello {{name}}',
      variables: ['name'],
      category: 'general',
    };
    mockPromptTemplateService.get.mockResolvedValue(template);

    const params = Promise.resolve({ id: 'tmpl-1' });
    const response = await GET(makeGetRequest('tmpl-1'), { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.template).toEqual(template);
    expect(mockPromptTemplateService.get).toHaveBeenCalledWith('tmpl-1');
  });

  it('should return 404 if template not found', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockPromptTemplateService.get.mockResolvedValue(null);

    const params = Promise.resolve({ id: 'non-existent' });
    const response = await GET(makeGetRequest('non-existent'), { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toMatch(/not found/i);
  });
});

describe('PUT /api/templates/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update template and return updated version', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const updated = {
      id: 'tmpl-1',
      name: 'Updated Template',
      content: 'Hello {{world}}',
      variables: ['world'],
      category: 'general',
    };
    mockPromptTemplateService.update.mockResolvedValue(updated);

    const params = Promise.resolve({ id: 'tmpl-1' });
    const response = await PUT(
      makePutRequest('tmpl-1', { name: 'Updated Template', content: 'Hello {{world}}' }),
      { params }
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.template).toEqual(updated);
    expect(mockPromptTemplateService.update).toHaveBeenCalledWith('tmpl-1', {
      name: 'Updated Template',
      content: 'Hello {{world}}',
    });
  });
});

describe('DELETE /api/templates/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete template and return success', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockPromptTemplateService.delete.mockResolvedValue(undefined);

    const params = Promise.resolve({ id: 'tmpl-1' });
    const response = await DELETE(makeDeleteRequest('tmpl-1'), { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockPromptTemplateService.delete).toHaveBeenCalledWith('tmpl-1');
  });
});
