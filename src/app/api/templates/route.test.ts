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
    create: vi.fn(),
    list: vi.fn(),
  },
}));
vi.mock('@/lib/db/prompt-template.service.singleton', () => ({
  promptTemplateService: mockPromptTemplateService,
}));

// ---------------------------------------------------------------------------
// System under test
// ---------------------------------------------------------------------------

import { POST, GET } from './route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePostRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost/api/templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeGetRequest(queryParams?: string): Request {
  const url = queryParams
    ? `http://localhost/api/templates?${queryParams}`
    : 'http://localhost/api/templates';
  return new Request(url, { method: 'GET' });
}

const MOCK_USER = { id: 'user-1', clerkId: 'clerk-abc', email: 'test@example.com' };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/templates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const response = await POST(makePostRequest({ name: 'Test', content: 'Hello' }));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockPromptTemplateService.create).not.toHaveBeenCalled();
  });

  it('should return 400 if name or content is missing', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    // Missing content
    const response1 = await POST(makePostRequest({ name: 'Test' }));
    const data1 = await response1.json();
    expect(response1.status).toBe(400);
    expect(data1.error).toMatch(/name.*content|content.*name|required/i);

    // Missing name
    const response2 = await POST(makePostRequest({ content: 'Hello' }));
    const data2 = await response2.json();
    expect(response2.status).toBe(400);
    expect(data2.error).toMatch(/name.*content|content.*name|required/i);
  });

  it('should create a template and return it', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const createdTemplate = {
      id: 'tmpl-1',
      userId: MOCK_USER.id,
      name: 'Email Template',
      content: 'Dear {{name}}, welcome!',
      category: 'email',
      variables: ['name'],
      isPublic: false,
      createdAt: '2026-02-23T10:00:00Z',
      updatedAt: '2026-02-23T10:00:00Z',
    };
    mockPromptTemplateService.create.mockResolvedValue(createdTemplate);

    const response = await POST(
      makePostRequest({
        name: 'Email Template',
        content: 'Dear {{name}}, welcome!',
        category: 'email',
      })
    );
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.template).toEqual(createdTemplate);
    expect(mockPromptTemplateService.create).toHaveBeenCalledWith({
      userId: MOCK_USER.id,
      name: 'Email Template',
      content: 'Dear {{name}}, welcome!',
      category: 'email',
    });
  });
});

describe('GET /api/templates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const response = await GET(makeGetRequest());
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockPromptTemplateService.list).not.toHaveBeenCalled();
  });

  it('should list templates for authenticated user', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const templates = [
      { id: 'tmpl-1', name: 'Template 1', category: 'general' },
      { id: 'tmpl-2', name: 'Template 2', category: 'email' },
    ];
    mockPromptTemplateService.list.mockResolvedValue(templates);

    const response = await GET(makeGetRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.templates).toHaveLength(2);
    expect(mockPromptTemplateService.list).toHaveBeenCalledWith(MOCK_USER.id, {});
  });

  it('should support ?category filter', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const templates = [
      { id: 'tmpl-1', name: 'Email Template', category: 'email' },
    ];
    mockPromptTemplateService.list.mockResolvedValue(templates);

    const response = await GET(makeGetRequest('category=email'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.templates).toHaveLength(1);
    expect(mockPromptTemplateService.list).toHaveBeenCalledWith(MOCK_USER.id, {
      category: 'email',
    });
  });
});
