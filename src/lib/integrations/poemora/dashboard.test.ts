import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks (hoisted)
// ---------------------------------------------------------------------------

const { mockPoemoraClient } = vi.hoisted(() => ({
  mockPoemoraClient: {
    getCampaigns: vi.fn(),
    getCampaign: vi.fn(),
    getAdSets: vi.fn(),
    getMetrics: vi.fn(),
    getReport: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// System under test
// ---------------------------------------------------------------------------

import { DashboardService } from './dashboard';
import type { Campaign, CampaignReport, MetricData, DateRange } from './types';
import type { PlatformProvider } from './provider';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const dateRange: DateRange = { startDate: '2026-07-01', endDate: '2026-07-31' };

const activeCampaign: Campaign = {
  id: 'camp-1',
  name: 'Summer Sale 2026',
  status: 'active',
  platform: 'google',
  budget: 5000,
  spent: 2300,
  startDate: '2026-06-01',
  endDate: '2026-08-31',
};

const pausedCampaign: Campaign = {
  id: 'camp-2',
  name: 'Brand Awareness Q3',
  status: 'paused',
  platform: 'meta',
  budget: 3000,
  spent: 1200,
  startDate: '2026-07-01',
  endDate: '2026-09-30',
};

const completedCampaign: Campaign = {
  id: 'camp-3',
  name: 'Spring Launch',
  status: 'completed',
  platform: 'tiktok',
  budget: 2000,
  spent: 1950,
  startDate: '2026-03-01',
  endDate: '2026-05-31',
};

const makeReport = (campaign: Campaign, roas: number): CampaignReport => ({
  campaign,
  metrics: [
    {
      date: '2026-07-01',
      impressions: 10000,
      clicks: 500,
      conversions: 25,
      spend: campaign.spent,
      revenue: campaign.spent * roas,
      ctr: 0.05,
      cpc: 0.3,
      roas,
    },
  ],
  summary: {
    totalImpressions: 10000,
    totalClicks: 500,
    totalConversions: 25,
    totalSpend: campaign.spent,
    totalRevenue: campaign.spent * roas,
    avgCtr: 0.05,
    avgRoas: roas,
  },
});

const report1 = makeReport(activeCampaign, 3.0);
const report2 = makeReport(pausedCampaign, 5.0);
const report3 = makeReport(completedCampaign, 1.5);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DashboardService(mockPoemoraClient as unknown as PlatformProvider);
  });

  // ─── getDashboardSummary ───────────────────────────────────────────

  describe('getDashboardSummary', () => {
    it('should return summary with total and active campaign counts', async () => {
      mockPoemoraClient.getCampaigns.mockResolvedValue([
        activeCampaign,
        pausedCampaign,
        completedCampaign,
      ]);
      mockPoemoraClient.getReport
        .mockResolvedValueOnce(report1)
        .mockResolvedValueOnce(report2)
        .mockResolvedValueOnce(report3);

      const summary = await service.getDashboardSummary(dateRange);

      expect(summary.totalCampaigns).toBe(3);
      expect(summary.activeCampaigns).toBe(1);
    });

    it('should aggregate budget and spent across all campaigns', async () => {
      mockPoemoraClient.getCampaigns.mockResolvedValue([
        activeCampaign,
        pausedCampaign,
      ]);
      mockPoemoraClient.getReport
        .mockResolvedValueOnce(report1)
        .mockResolvedValueOnce(report2);

      const summary = await service.getDashboardSummary(dateRange);

      // 5000 + 3000
      expect(summary.totalBudget).toBe(8000);
      // 2300 + 1200
      expect(summary.totalSpent).toBe(3500);
    });

    it('should calculate total metrics from all campaign reports', async () => {
      mockPoemoraClient.getCampaigns.mockResolvedValue([
        activeCampaign,
        pausedCampaign,
      ]);
      mockPoemoraClient.getReport
        .mockResolvedValueOnce(report1)
        .mockResolvedValueOnce(report2);

      const summary = await service.getDashboardSummary(dateRange);

      // Each report has 10000 impressions, 500 clicks, 25 conversions
      expect(summary.metrics.totalImpressions).toBe(20000);
      expect(summary.metrics.totalClicks).toBe(1000);
      expect(summary.metrics.totalConversions).toBe(50);
      // Revenue: 2300*3.0 + 1200*5.0 = 6900 + 6000 = 12900
      expect(summary.metrics.totalRevenue).toBe(12900);
      // avgCtr: totalClicks / totalImpressions = 1000 / 20000 = 0.05
      expect(summary.metrics.avgCtr).toBeCloseTo(0.05, 4);
      // avgRoas: totalRevenue / totalSpent from reports = 12900 / (2300+1200) = 12900/3500
      expect(summary.metrics.avgRoas).toBeCloseTo(12900 / 3500, 4);
    });

    it('should handle empty campaign list', async () => {
      mockPoemoraClient.getCampaigns.mockResolvedValue([]);

      const summary = await service.getDashboardSummary(dateRange);

      expect(summary.totalCampaigns).toBe(0);
      expect(summary.activeCampaigns).toBe(0);
      expect(summary.totalBudget).toBe(0);
      expect(summary.totalSpent).toBe(0);
      expect(summary.metrics.totalImpressions).toBe(0);
      expect(summary.metrics.totalClicks).toBe(0);
      expect(summary.metrics.totalConversions).toBe(0);
      expect(summary.metrics.totalRevenue).toBe(0);
      expect(summary.metrics.avgCtr).toBe(0);
      expect(summary.metrics.avgRoas).toBe(0);
    });
  });

  // ─── getMetricsComparison ─────────────────────────────────────────

  describe('getMetricsComparison', () => {
    it('should return metrics for multiple campaigns', async () => {
      const metrics1: MetricData[] = [
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
      ];
      const metrics2: MetricData[] = [
        {
          date: '2026-07-01',
          impressions: 8000,
          clicks: 320,
          conversions: 16,
          spend: 120,
          revenue: 480,
          ctr: 0.04,
          cpc: 0.375,
          roas: 4.0,
        },
      ];

      mockPoemoraClient.getCampaign
        .mockResolvedValueOnce(activeCampaign)
        .mockResolvedValueOnce(pausedCampaign);
      mockPoemoraClient.getMetrics
        .mockResolvedValueOnce(metrics1)
        .mockResolvedValueOnce(metrics2);

      const result = await service.getMetricsComparison(
        ['camp-1', 'camp-2'],
        dateRange
      );

      expect(result.campaigns).toHaveLength(2);
      expect(result.campaigns[0].metrics).toEqual(metrics1);
      expect(result.campaigns[1].metrics).toEqual(metrics2);
    });

    it('should include campaign name with each metric set', async () => {
      mockPoemoraClient.getCampaign
        .mockResolvedValueOnce(activeCampaign)
        .mockResolvedValueOnce(pausedCampaign);
      mockPoemoraClient.getMetrics
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.getMetricsComparison(
        ['camp-1', 'camp-2'],
        dateRange
      );

      expect(result.campaigns[0].campaignId).toBe('camp-1');
      expect(result.campaigns[0].campaignName).toBe('Summer Sale 2026');
      expect(result.campaigns[1].campaignId).toBe('camp-2');
      expect(result.campaigns[1].campaignName).toBe('Brand Awareness Q3');
    });

    it('should handle empty campaignIds array', async () => {
      const result = await service.getMetricsComparison([], dateRange);

      expect(result.campaigns).toEqual([]);
      expect(mockPoemoraClient.getCampaign).not.toHaveBeenCalled();
      expect(mockPoemoraClient.getMetrics).not.toHaveBeenCalled();
    });
  });

  // ─── getTopCampaigns ──────────────────────────────────────────────

  describe('getTopCampaigns', () => {
    it('should return campaigns sorted by ROAS descending', async () => {
      mockPoemoraClient.getCampaigns.mockResolvedValue([
        activeCampaign,
        pausedCampaign,
        completedCampaign,
      ]);
      // ROAS: camp-1 = 3.0, camp-2 = 5.0, camp-3 = 1.5
      mockPoemoraClient.getReport
        .mockResolvedValueOnce(report1)
        .mockResolvedValueOnce(report2)
        .mockResolvedValueOnce(report3);

      const top = await service.getTopCampaigns(dateRange);

      expect(top[0].id).toBe('camp-2'); // roas 5.0
      expect(top[1].id).toBe('camp-1'); // roas 3.0
      expect(top[2].id).toBe('camp-3'); // roas 1.5
    });

    it('should respect limit parameter (default 5)', async () => {
      mockPoemoraClient.getCampaigns.mockResolvedValue([
        activeCampaign,
        pausedCampaign,
        completedCampaign,
      ]);
      mockPoemoraClient.getReport
        .mockResolvedValueOnce(report1)
        .mockResolvedValueOnce(report2)
        .mockResolvedValueOnce(report3);

      const top = await service.getTopCampaigns(dateRange, 2);

      expect(top).toHaveLength(2);
      expect(top[0].id).toBe('camp-2'); // roas 5.0
      expect(top[1].id).toBe('camp-1'); // roas 3.0
    });

    it('should handle when no campaigns exist', async () => {
      mockPoemoraClient.getCampaigns.mockResolvedValue([]);

      const top = await service.getTopCampaigns(dateRange);

      expect(top).toEqual([]);
      expect(mockPoemoraClient.getReport).not.toHaveBeenCalled();
    });
  });
});
