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
    renderTemplate: vi.fn(),
  },
}));
vi.mock('@/lib/db/prompt-template.service.singleton', () => ({
  promptTemplateService: mockPromptTemplateService,
}));

// ---------------------------------------------------------------------------
// System under test
// ---------------------------------------------------------------------------

import { POST } from './route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePostRequest(id: string, body: Record<string, unknown>): Request {
  return new Request(`http://localhost/api/templates/${id}/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const MOCK_USER = { id: 'user-1', email: 'test@example.com' };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/templates/[id]/render', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const params = Promise.resolve({ id: 'tmpl-1' });
    const response = await POST(
      makePostRequest('tmpl-1', { variables: { name: 'Alice' } }),
      { params }
    );
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockPromptTemplateService.get).not.toHaveBeenCalled();
  });

  it('should render template with provided variables', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const template = {
      id: 'tmpl-1',
      content: 'Hello {{name}}, welcome to {{company}}!',
      variables: ['name', 'company'],
    };
    mockPromptTemplateService.get.mockResolvedValue(template);
    mockPromptTemplateService.renderTemplate.mockReturnValue(
      'Hello Alice, welcome to Acme Corp!'
    );

    const params = Promise.resolve({ id: 'tmpl-1' });
    const response = await POST(
      makePostRequest('tmpl-1', { variables: { name: 'Alice', company: 'Acme Corp' } }),
      { params }
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.rendered).toBe('Hello Alice, welcome to Acme Corp!');
    expect(mockPromptTemplateService.get).toHaveBeenCalledWith('tmpl-1');
    expect(mockPromptTemplateService.renderTemplate).toHaveBeenCalledWith(
      'Hello {{name}}, welcome to {{company}}!',
      { name: 'Alice', company: 'Acme Corp' }
    );
  });

  it('should return 404 if template not found', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockPromptTemplateService.get.mockResolvedValue(null);

    const params = Promise.resolve({ id: 'non-existent' });
    const response = await POST(
      makePostRequest('non-existent', { variables: { name: 'Alice' } }),
      { params }
    );
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toMatch(/not found/i);
    expect(mockPromptTemplateService.renderTemplate).not.toHaveBeenCalled();
  });
});
