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

const { mockGetSettings, mockUpdateSettings } = vi.hoisted(() => ({
  mockGetSettings: vi.fn(),
  mockUpdateSettings: vi.fn(),
}));
vi.mock('@/lib/db/settings.service.singleton', () => ({
  settingsService: {
    getSettings: mockGetSettings,
    updateSettings: mockUpdateSettings,
  },
}));

// ---------------------------------------------------------------------------
// System under test
// ---------------------------------------------------------------------------

import { GET, PUT } from './route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeGetRequest(): Request {
  return new Request('http://localhost/api/settings', { method: 'GET' });
}

function makePutRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const MOCK_USER = { id: 'user-1', email: 'test@example.com' };

const MOCK_SETTINGS = {
  id: 'settings-1',
  userId: 'user-1',
  defaultModel: 'claude-sonnet-4-6',
  theme: 'system',
  apiKeys: null,
  mcpServers: null,
  agentPreferences: null,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockGetSettings).not.toHaveBeenCalled();
  });

  it('should return settings for authenticated user', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockGetSettings.mockResolvedValue(MOCK_SETTINGS);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.settings).toEqual(MOCK_SETTINGS);
    expect(mockGetSettings).toHaveBeenCalledWith(MOCK_USER.id);
  });
});

describe('PUT /api/settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const response = await PUT(makePutRequest({ theme: 'dark' }));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockUpdateSettings).not.toHaveBeenCalled();
  });

  it('should return 400 with empty body', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const response = await PUT(makePutRequest({}));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('No fields to update');
    expect(mockUpdateSettings).not.toHaveBeenCalled();
  });

  it('should update settings successfully', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    const updated = { ...MOCK_SETTINGS, defaultModel: 'gpt-4o', theme: 'dark' };
    mockUpdateSettings.mockResolvedValue(updated);

    const response = await PUT(makePutRequest({ defaultModel: 'gpt-4o', theme: 'dark' }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.settings).toEqual(updated);
    expect(mockUpdateSettings).toHaveBeenCalledWith(MOCK_USER.id, {
      defaultModel: 'gpt-4o',
      theme: 'dark',
    });
  });

  it('should update partial settings (only defaultModel)', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    const updated = { ...MOCK_SETTINGS, defaultModel: 'gemini-pro' };
    mockUpdateSettings.mockResolvedValue(updated);

    const response = await PUT(makePutRequest({ defaultModel: 'gemini-pro' }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.settings.defaultModel).toBe('gemini-pro');
    expect(mockUpdateSettings).toHaveBeenCalledWith(MOCK_USER.id, {
      defaultModel: 'gemini-pro',
    });
  });

  it('should update apiKeys', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    const keys = { openai: 'sk-123', anthropic: 'sk-ant-456' };
    const updated = { ...MOCK_SETTINGS, apiKeys: keys };
    mockUpdateSettings.mockResolvedValue(updated);

    const response = await PUT(makePutRequest({ apiKeys: keys }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.settings.apiKeys).toEqual(keys);
    expect(mockUpdateSettings).toHaveBeenCalledWith(MOCK_USER.id, {
      apiKeys: keys,
    });
  });
});
