import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: class MockPrismaClient {
      $connect = vi.fn();
      $disconnect = vi.fn();
      conversation = {};
      message = {};
      user = {};
    },
  };
});

describe('Prisma Client', () => {
  beforeEach(() => {
    vi.resetModules();
    (globalThis as Record<string, unknown>).prisma = undefined;
  });

  it('should export a prisma instance', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://test:test@localhost:5432/test');
    const { prisma } = await import('./prisma');
    expect(prisma).toBeDefined();
    expect(prisma.$connect).toBeDefined();
    expect(prisma.$disconnect).toBeDefined();
    vi.unstubAllEnvs();
  });

  it('should reuse singleton in development', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://test:test@localhost:5432/test');
    const mod1 = await import('./prisma');
    const mod2 = await import('./prisma');
    expect(mod1.prisma).toBe(mod2.prisma);
    vi.unstubAllEnvs();
  });

  it('should return proxy when DATABASE_URL is not set', async () => {
    vi.stubEnv('DATABASE_URL', '');
    const { prisma } = await import('./prisma');
    expect(prisma).toBeDefined();
    expect(() => prisma.$connect).toThrow('Database not configured');
    vi.unstubAllEnvs();
  });
});
