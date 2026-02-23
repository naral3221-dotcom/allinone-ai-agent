import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks (hoisted)
// ---------------------------------------------------------------------------

const { mockGetAuthenticatedUser } = vi.hoisted(() => ({
  mockGetAuthenticatedUser: vi.fn(),
}));
vi.mock('@/lib/auth/get-user', () => ({
  getAuthenticatedUser: mockGetAuthenticatedUser,
}));

const { mockGenerate } = vi.hoisted(() => ({
  mockGenerate: vi.fn(),
}));
vi.mock('@/lib/integrations/poemora/insights.singleton', () => ({
  insightGenerator: { generate: mockGenerate },
}));

// ---------------------------------------------------------------------------
// System under test
// ---------------------------------------------------------------------------

import { POST } from './route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePostRequest(body: unknown): Request {
  return new Request('http://localhost/api/marketing/insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const MOCK_USER = { id: 'user-1', clerkId: 'clerk-abc', email: 'test@example.com' };

const MOCK_INSIGHT = {
  summary: 'Overall campaign performance is strong.',
  recommendations: ['Increase budget for top campaigns'],
  highlights: [
    {
      campaignId: 'camp-1',
      campaignName: 'Summer Sale',
      metric: 'ROAS',
      value: 3.0,
      trend: 'up',
    },
  ],
  generatedAt: '2026-07-15T12:00:00.000Z',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/marketing/insights', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 without auth', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const response = await POST(
      makePostRequest({
        dateRange: { startDate: '2026-07-01', endDate: '2026-07-31' },
      })
    );
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it('should return 400 without dateRange', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const response = await POST(makePostRequest({}));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('dateRange is required');
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it('should return 400 when dateRange is missing startDate or endDate', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const response = await POST(
      makePostRequest({ dateRange: { startDate: '2026-07-01' } })
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('dateRange must contain startDate and endDate');
  });

  it('should return 200 with generated insight', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockGenerate.mockResolvedValue(MOCK_INSIGHT);

    const response = await POST(
      makePostRequest({
        dateRange: { startDate: '2026-07-01', endDate: '2026-07-31' },
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.insight).toEqual(MOCK_INSIGHT);
    expect(mockGenerate).toHaveBeenCalledOnce();
    expect(mockGenerate).toHaveBeenCalledWith({
      dateRange: { startDate: '2026-07-01', endDate: '2026-07-31' },
    });
  });

  it('should pass focus parameter correctly', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockGenerate.mockResolvedValue(MOCK_INSIGHT);

    const response = await POST(
      makePostRequest({
        dateRange: { startDate: '2026-07-01', endDate: '2026-07-31' },
        focus: 'budget',
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.insight).toEqual(MOCK_INSIGHT);
    expect(mockGenerate).toHaveBeenCalledWith({
      dateRange: { startDate: '2026-07-01', endDate: '2026-07-31' },
      focus: 'budget',
    });
  });

  it('should pass campaignIds when provided', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockGenerate.mockResolvedValue(MOCK_INSIGHT);

    const response = await POST(
      makePostRequest({
        campaignIds: ['camp-1', 'camp-2'],
        dateRange: { startDate: '2026-07-01', endDate: '2026-07-31' },
        focus: 'performance',
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.insight).toEqual(MOCK_INSIGHT);
    expect(mockGenerate).toHaveBeenCalledWith({
      campaignIds: ['camp-1', 'camp-2'],
      dateRange: { startDate: '2026-07-01', endDate: '2026-07-31' },
      focus: 'performance',
    });
  });

  it('should ignore invalid focus values', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockGenerate.mockResolvedValue(MOCK_INSIGHT);

    const response = await POST(
      makePostRequest({
        dateRange: { startDate: '2026-07-01', endDate: '2026-07-31' },
        focus: 'invalid-focus',
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.insight).toEqual(MOCK_INSIGHT);
    // Should not pass invalid focus
    expect(mockGenerate).toHaveBeenCalledWith({
      dateRange: { startDate: '2026-07-01', endDate: '2026-07-31' },
    });
  });
});
