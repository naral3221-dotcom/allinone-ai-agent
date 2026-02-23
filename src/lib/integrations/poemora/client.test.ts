import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { PoemoraClient } from './client';
import type { Campaign, AdSet, MetricData, CampaignReport } from './types';

const BASE_URL = 'https://api.poemora.io';
const API_KEY = 'test-poemora-key';

const createClient = () =>
  new PoemoraClient({ baseUrl: BASE_URL, apiKey: API_KEY });

const mockCampaign: Campaign = {
  id: 'camp-1',
  name: 'Summer Sale 2026',
  status: 'active',
  platform: 'google',
  budget: 5000,
  spent: 2300,
  startDate: '2026-06-01',
  endDate: '2026-08-31',
};

const mockAdSet: AdSet = {
  id: 'adset-1',
  campaignId: 'camp-1',
  name: 'Young Adults 18-24',
  status: 'active',
  targetAudience: '18-24, urban, tech-savvy',
  dailyBudget: 100,
};

const mockMetric: MetricData = {
  date: '2026-07-01',
  impressions: 10000,
  clicks: 500,
  conversions: 25,
  spend: 150,
  revenue: 750,
  ctr: 0.05,
  cpc: 0.3,
  roas: 5.0,
};

const mockReport: CampaignReport = {
  campaign: mockCampaign,
  metrics: [mockMetric],
  summary: {
    totalImpressions: 10000,
    totalClicks: 500,
    totalConversions: 25,
    totalSpend: 150,
    totalRevenue: 750,
    avgCtr: 0.05,
    avgRoas: 5.0,
  },
};

describe('PoemoraClient', () => {
  let client: PoemoraClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = createClient();
  });

  // ─── getCampaigns (3 tests) ────────────────────────────────────────

  describe('getCampaigns', () => {
    it('should fetch campaigns from /api/campaigns', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ campaigns: [mockCampaign] }),
      });

      const campaigns = await client.getCampaigns();

      expect(campaigns).toHaveLength(1);
      expect(campaigns[0]).toEqual(mockCampaign);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/campaigns'),
        expect.any(Object)
      );
    });

    it('should send Authorization header with API key', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ campaigns: [] }),
      });

      await client.getCampaigns();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${API_KEY}`,
          }),
        })
      );
    });

    it('should throw on server error', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });

      await expect(client.getCampaigns()).rejects.toThrow('Poemora API error');
    });
  });

  // ─── getCampaign (2 tests) ─────────────────────────────────────────

  describe('getCampaign', () => {
    it('should fetch single campaign from /api/campaigns/:id', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCampaign),
      });

      const campaign = await client.getCampaign('camp-1');

      expect(campaign).toEqual(mockCampaign);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/campaigns/camp-1'),
        expect.any(Object)
      );
    });

    it('should return null for 404', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 404 });

      const campaign = await client.getCampaign('nonexistent');

      expect(campaign).toBeNull();
    });
  });

  // ─── getAdSets (2 tests) ───────────────────────────────────────────

  describe('getAdSets', () => {
    it('should fetch ad sets from /api/campaigns/:id/adsets', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ adSets: [mockAdSet] }),
      });

      const adSets = await client.getAdSets('camp-1');

      expect(adSets).toHaveLength(1);
      expect(adSets[0]).toEqual(mockAdSet);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/campaigns/camp-1/adsets'),
        expect.any(Object)
      );
    });

    it('should return empty array when none exist', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ adSets: [] }),
      });

      const adSets = await client.getAdSets('camp-1');

      expect(adSets).toEqual([]);
    });
  });

  // ─── getMetrics (3 tests) ──────────────────────────────────────────

  describe('getMetrics', () => {
    const dateRange = { startDate: '2026-07-01', endDate: '2026-07-31' };

    it('should fetch metrics with date range query params', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ metrics: [mockMetric] }),
      });

      const metrics = await client.getMetrics('camp-1', dateRange);

      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toEqual(mockMetric);
    });

    it('should include startDate and endDate in request URL', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ metrics: [] }),
      });

      await client.getMetrics('camp-1', dateRange);

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('startDate=2026-07-01');
      expect(calledUrl).toContain('endDate=2026-07-31');
    });

    it('should throw on server error when fetching metrics', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 502 });

      await expect(client.getMetrics('camp-1', dateRange)).rejects.toThrow(
        'Poemora API error'
      );
    });
  });

  // ─── getReport (3 tests) ───────────────────────────────────────────

  describe('getReport', () => {
    const dateRange = { startDate: '2026-07-01', endDate: '2026-07-31' };

    it('should fetch report from /api/campaigns/:id/report', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockReport),
      });

      const report = await client.getReport('camp-1', dateRange);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/campaigns/camp-1/report'),
        expect.any(Object)
      );
    });

    it('should return campaign with metrics and summary', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockReport),
      });

      const report = await client.getReport('camp-1', dateRange);

      expect(report.campaign).toEqual(mockCampaign);
      expect(report.metrics).toHaveLength(1);
      expect(report.summary).toBeDefined();
      expect(report.summary.totalImpressions).toBe(10000);
    });

    it('should include summary aggregates in report', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockReport),
      });

      const report = await client.getReport('camp-1', dateRange);

      expect(report.summary.totalClicks).toBe(500);
      expect(report.summary.totalConversions).toBe(25);
      expect(report.summary.totalSpend).toBe(150);
      expect(report.summary.totalRevenue).toBe(750);
      expect(report.summary.avgCtr).toBe(0.05);
      expect(report.summary.avgRoas).toBe(5.0);
    });
  });

  // ─── Error handling (2 tests) ──────────────────────────────────────

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(client.getCampaigns()).rejects.toThrow(
        'Poemora network error on /api/campaigns'
      );
    });

    it('should include endpoint info in error messages', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 503 });

      await expect(client.getMetrics('camp-1', { startDate: '2026-01-01', endDate: '2026-01-31' })).rejects.toThrow(
        '/api/campaigns/camp-1/metrics'
      );
    });
  });
});
