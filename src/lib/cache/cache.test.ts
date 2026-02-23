import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cacheGet, cacheSet, cacheDel, cacheGetOrSet } from './cache';

const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
};

vi.mock('./redis', () => ({
  getRedis: () => mockRedis,
}));

describe('Cache utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('cacheGet', () => {
    it('should return cached value', async () => {
      mockRedis.get.mockResolvedValue({ name: 'test' });
      const result = await cacheGet('key');
      expect(result).toEqual({ name: 'test' });
      expect(mockRedis.get).toHaveBeenCalledWith('key');
    });

    it('should return null for missing key', async () => {
      mockRedis.get.mockResolvedValue(null);
      const result = await cacheGet('missing');
      expect(result).toBeNull();
    });
  });

  describe('cacheSet', () => {
    it('should set value with default TTL', async () => {
      mockRedis.set.mockResolvedValue('OK');
      await cacheSet('key', 'value');
      expect(mockRedis.set).toHaveBeenCalledWith('key', 'value', { ex: 3600 });
    });

    it('should set value with custom TTL', async () => {
      mockRedis.set.mockResolvedValue('OK');
      await cacheSet('key', 'value', 60);
      expect(mockRedis.set).toHaveBeenCalledWith('key', 'value', { ex: 60 });
    });
  });

  describe('cacheDel', () => {
    it('should delete key', async () => {
      mockRedis.del.mockResolvedValue(1);
      await cacheDel('key');
      expect(mockRedis.del).toHaveBeenCalledWith('key');
    });
  });

  describe('cacheGetOrSet', () => {
    it('should return cached value without calling fetcher', async () => {
      mockRedis.get.mockResolvedValue('cached');
      const fetcher = vi.fn().mockResolvedValue('fresh');

      const result = await cacheGetOrSet('key', fetcher);
      expect(result).toBe('cached');
      expect(fetcher).not.toHaveBeenCalled();
    });

    it('should call fetcher and cache result on miss', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');
      const fetcher = vi.fn().mockResolvedValue('fresh');

      const result = await cacheGetOrSet('key', fetcher, 120);
      expect(result).toBe('fresh');
      expect(fetcher).toHaveBeenCalled();
      expect(mockRedis.set).toHaveBeenCalledWith('key', 'fresh', { ex: 120 });
    });
  });
});
