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
    getDashboardSummary: vi.fn(),
  },
}));
vi.mock('@/lib/integrations/poemora/dashboard.singleton', () => ({
  dashboardService: mockDashboardService,
}));

// ---------------------------------------------------------------------------
// System under test
// ---------------------------------------------------------------------------

import { GET } from './route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeGetRequest(queryParams?: string): Request {
  const url = queryParams
    ? `http://localhost/api/marketing/dashboard?${queryParams}`
    : 'http://localhost/api/marketing/dashboard';
  return new Request(url, { method: 'GET' });
}

const MOCK_USER = { id: 'user-1', clerkId: 'clerk-abc', email: 'test@example.com' };

const MOCK_SUMMARY = {
  totalCampaigns: 3,
  activeCampaigns: 1,
  totalBudget: 10000,
  totalSpent: 5450,
  metrics: {
    totalImpressions: 30000,
    totalClicks: 1500,
    totalConversions: 75,
    totalRevenue: 19350,
    avgCtr: 0.05,
    avgRoas: 3.55,
  },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/marketing/dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const response = await GET(makeGetRequest());
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockDashboardService.getDashboardSummary).not.toHaveBeenCalled();
  });

  it('should return dashboard summary', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockDashboardService.getDashboardSummary.mockResolvedValue(MOCK_SUMMARY);

    const response = await GET(makeGetRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.summary).toEqual(MOCK_SUMMARY);
    expect(mockDashboardService.getDashboardSummary).toHaveBeenCalledOnce();
  });

  it('should support custom date range query params', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);
    mockDashboardService.getDashboardSummary.mockResolvedValue(MOCK_SUMMARY);

    const response = await GET(
      makeGetRequest('startDate=2026-06-01&endDate=2026-06-30')
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.summary).toEqual(MOCK_SUMMARY);
    expect(mockDashboardService.getDashboardSummary).toHaveBeenCalledWith({
      startDate: '2026-06-01',
      endDate: '2026-06-30',
    });
  });
});
