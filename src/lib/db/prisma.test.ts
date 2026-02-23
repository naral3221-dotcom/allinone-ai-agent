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
  });

  it('should export a prisma instance', async () => {
    const { prisma } = await import('./prisma');
    expect(prisma).toBeDefined();
    expect(prisma.$connect).toBeDefined();
    expect(prisma.$disconnect).toBeDefined();
  });

  it('should reuse singleton in development', async () => {
    const mod1 = await import('./prisma');
    const mod2 = await import('./prisma');
    expect(mod1.prisma).toBe(mod2.prisma);
  });
});
