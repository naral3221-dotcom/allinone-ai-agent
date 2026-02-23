import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRateLimit } from './rate-limit';

const mockPipeline = {
  zremrangebyscore: vi.fn(),
  zadd: vi.fn(),
  zcard: vi.fn(),
  expire: vi.fn(),
  exec: vi.fn(),
};

const mockRedis = {
  pipeline: vi.fn(() => mockPipeline),
};

vi.mock('./redis', () => ({
  getRedis: () => mockRedis,
}));

describe('Rate Limiter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow request within limit', async () => {
    mockPipeline.exec.mockResolvedValue([0, 1, 3, 1]); // count = 3

    const result = await checkRateLimit('user:123', 10, 60);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(7);
    expect(result.resetAt).toBeInstanceOf(Date);
  });

  it('should deny request exceeding limit', async () => {
    mockPipeline.exec.mockResolvedValue([0, 1, 11, 1]); // count = 11

    const result = await checkRateLimit('user:123', 10, 60);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should allow request at exact limit', async () => {
    mockPipeline.exec.mockResolvedValue([0, 1, 10, 1]); // count = 10

    const result = await checkRateLimit('user:123', 10, 60);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
  });
});
