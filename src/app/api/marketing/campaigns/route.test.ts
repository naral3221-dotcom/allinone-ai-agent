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

const { mockPoemoraClient } = vi.hoisted(() => ({
  mockPoemoraClient: {
    getCampaigns: vi.fn(),
  },
}));
vi.mock('@/lib/integrations/poemora/client.singleton', () => ({
  poemoraClient: mockPoemoraClient,
}));

// ---------------------------------------------------------------------------
// System under test
// ---------------------------------------------------------------------------

import { GET } from './route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeGetRequest(): Request {
  return new Request('http://localhost/api/marketing/campaigns', {
    method: 'GET',
  });
}

const MOCK_USER = { id: 'user-1', clerkId: 'clerk-abc', email: 'test@example.com' };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/marketing/campaigns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const response = await GET(makeGetRequest());
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockPoemoraClient.getCampaigns).not.toHaveBeenCalled();
  });

  it('should return list of campaigns', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(MOCK_USER);

    const campaigns = [
      {
        id: 'camp-1',
        name: 'Summer Sale',
        status: 'active',
        platform: 'google',
        budget: 5000,
        spent: 2300,
        startDate: '2026-06-01',
      },
      {
        id: 'camp-2',
        name: 'Brand Awareness',
        status: 'paused',
        platform: 'meta',
        budget: 3000,
        spent: 1200,
        startDate: '2026-07-01',
      },
    ];
    mockPoemoraClient.getCampaigns.mockResolvedValue(campaigns);

    const response = await GET(makeGetRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.campaigns).toHaveLength(2);
    expect(data.campaigns).toEqual(campaigns);
    expect(mockPoemoraClient.getCampaigns).toHaveBeenCalledOnce();
  });
});
