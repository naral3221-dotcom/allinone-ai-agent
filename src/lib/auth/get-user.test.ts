import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockCurrentUser, mockEnsureUser } = vi.hoisted(() => ({
  mockCurrentUser: vi.fn(),
  mockEnsureUser: vi.fn(),
}));

vi.mock('@clerk/nextjs/server', () => ({
  currentUser: mockCurrentUser,
}));

vi.mock('@/lib/db', () => ({
  conversationService: {
    ensureUser: mockEnsureUser,
  },
}));

import { getAuthenticatedUser } from './get-user';

describe('getAuthenticatedUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when no clerk user', async () => {
    mockCurrentUser.mockResolvedValue(null);

    const result = await getAuthenticatedUser();
    expect(result).toBeNull();
  });

  it('should upsert and return user when authenticated', async () => {
    mockCurrentUser.mockResolvedValue({
      id: 'clerk-123',
      emailAddresses: [{ emailAddress: 'test@test.com' }],
      firstName: 'Test',
    });
    mockEnsureUser.mockResolvedValue({
      id: 'user-1',
      clerkId: 'clerk-123',
      email: 'test@test.com',
    });

    const result = await getAuthenticatedUser();
    expect(result).toEqual({
      id: 'user-1',
      clerkId: 'clerk-123',
      email: 'test@test.com',
    });
    expect(mockEnsureUser).toHaveBeenCalledWith(
      'clerk-123',
      'test@test.com',
      'Test'
    );
  });
});
