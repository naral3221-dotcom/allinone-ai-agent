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

const { mockDashboardService } = vi.hoisted(() => ({
  mockDashboardService: {
    getMetricsComparison: vi.fn(),
  },
}));
vi.mock('@/lib/integrations/poemora/dashboard.singleton', () => ({
  dashboardService: mockDashboardService,
}));

// ---------------------------------------------------------------------------
// System under test
// ---------------------------------------------------------------------------

import { POST } from './route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePostRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost/api/marketing/metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const MOCK_USER = { id: 'user-1', email: 'test@example.com' };

const MOCK_COMPARISON = {
  campaigns: [
    {
      campaignId: 'camp-1',
      campaignName: 'Summer Sale',
      metrics: [
        {
          date: '2026-07-01',
          impressions: 10000,
          clicks: 500,
          conversions: 25,
          spend: 150,
          revenue: 750,
          ctr: 0.05,
          cpc: 0.3,
          roas: 5.0,
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/marketing/metrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const response = await POST(
      makePostRequest({
        campaignIds: ['camp-1'],
        dateRange: { startDate: '2026-07-01', endDate: '2026-07-31' },
      })
    );
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockDashboardService.getMetricsComparison).not.toHaveBeenCalled();
  });

  it('should return 400 if campaignIds is missing', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const response = await POST(
      makePostRequest({
        dateRange: { startDate: '2026-07-01', endDate: '2026-07-31' },
      })
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/campaignIds/i);
    expect(mockDashboardService.getMetricsComparison).not.toHaveBeenCalled();
  });

  it('should return metrics comparison', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockDashboardService.getMetricsComparison.mockResolvedValue(MOCK_COMPARISON);

    const response = await POST(
      makePostRequest({
        campaignIds: ['camp-1'],
        dateRange: { startDate: '2026-07-01', endDate: '2026-07-31' },
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.comparison).toEqual(MOCK_COMPARISON);
    expect(mockDashboardService.getMetricsComparison).toHaveBeenCalledWith(
      ['camp-1'],
      { startDate: '2026-07-01', endDate: '2026-07-31' }
    );
  });
});
