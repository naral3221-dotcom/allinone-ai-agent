import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockAuth, mockFindUnique } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockFindUnique: vi.fn(),
}));

vi.mock('@/lib/auth/auth', () => ({
  auth: mockAuth,
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: {
      findUnique: mockFindUnique,
    },
  },
}));

import { getAuthenticatedUser } from './get-user';

describe('getAuthenticatedUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when no session', async () => {
    mockAuth.mockResolvedValue(null);
    const result = await getAuthenticatedUser();
    expect(result).toBeNull();
  });

  it('should return null when session has no user id', async () => {
    mockAuth.mockResolvedValue({ user: {} });
    const result = await getAuthenticatedUser();
    expect(result).toBeNull();
  });

  it('should return dev user when DATABASE_URL is not set', async () => {
    vi.stubEnv('DATABASE_URL', '');
    mockAuth.mockResolvedValue({ user: { id: 'user-1', email: 'test@test.com' } });

    const result = await getAuthenticatedUser();
    expect(result).toEqual(expect.objectContaining({
      id: 'dev-user',
      email: 'dev@localhost',
      name: 'Dev User',
    }));
    expect(mockFindUnique).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });

  it('should return user from database when DATABASE_URL is set', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://test:test@localhost:5432/test');
    mockAuth.mockResolvedValue({ user: { id: 'user-1', email: 'test@test.com' } });
    mockFindUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@test.com',
      name: 'Test',
    });

    const result = await getAuthenticatedUser();
    expect(result).toEqual({
      id: 'user-1',
      email: 'test@test.com',
      name: 'Test',
    });
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
    });
    vi.unstubAllEnvs();
  });
});
