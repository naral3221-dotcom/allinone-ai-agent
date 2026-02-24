import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks (hoisted)
// ---------------------------------------------------------------------------

const { mockGenerateText } = vi.hoisted(() => ({
  mockGenerateText: vi.fn(),
}));

vi.mock('ai', () => ({
  generateText: mockGenerateText,
}));

vi.mock('@/lib/ai/providers', () => ({
  models: {
    'claude-sonnet': { modelId: 'claude-sonnet' },
  },
}));

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

import { InsightGenerator } from './insights';
import type { InsightRequest } from './insights';
import type { Campaign, CampaignReport } from './types';
import type { PlatformProvider } from './provider';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

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

const MOCK_AI_RESPONSE = JSON.stringify({
  summary: 'Overall campaign performance is strong with an average ROAS of 3.7.',
  recommendations: [
    'Increase budget for Summer Sale campaign due to high ROAS',
    'Consider reactivating Brand Awareness campaign',
  ],
  highlights: [
    {
      campaignId: 'camp-1',
      campaignName: 'Summer Sale 2026',
      metric: 'ROAS',
      value: 3.0,
      trend: 'up',
    },
    {
      campaignId: 'camp-2',
      campaignName: 'Brand Awareness Q3',
      metric: 'ROAS',
      value: 5.0,
      trend: 'stable',
    },
  ],
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('InsightGenerator', () => {
  let generator: InsightGenerator;

  beforeEach(() => {
    vi.clearAllMocks();
    generator = new InsightGenerator(
      mockPoemoraClient as unknown as PlatformProvider
    );
  });

  it('should generate insights for all campaigns when no campaignIds filter provided', async () => {
    mockPoemoraClient.getCampaigns.mockResolvedValue([
      activeCampaign,
      pausedCampaign,
    ]);
    mockPoemoraClient.getReport
      .mockResolvedValueOnce(report1)
      .mockResolvedValueOnce(report2);
    mockGenerateText.mockResolvedValue({ text: MOCK_AI_RESPONSE });

    const request: InsightRequest = {
      dateRange: { startDate: '2026-07-01', endDate: '2026-07-31' },
    };

    const insight = await generator.generate(request);

    expect(mockPoemoraClient.getCampaigns).toHaveBeenCalledOnce();
    expect(mockPoemoraClient.getReport).toHaveBeenCalledTimes(2);
    expect(mockPoemoraClient.getReport).toHaveBeenCalledWith('camp-1', request.dateRange);
    expect(mockPoemoraClient.getReport).toHaveBeenCalledWith('camp-2', request.dateRange);
    expect(insight.summary).toContain('strong');
    expect(insight.recommendations).toHaveLength(2);
    expect(insight.highlights).toHaveLength(2);
  });

  it('should generate insights for specific campaigns when campaignIds filter provided', async () => {
    mockPoemoraClient.getCampaigns.mockResolvedValue([
      activeCampaign,
      pausedCampaign,
    ]);
    mockPoemoraClient.getReport.mockResolvedValueOnce(report1);
    mockGenerateText.mockResolvedValue({ text: MOCK_AI_RESPONSE });

    const request: InsightRequest = {
      campaignIds: ['camp-1'],
      dateRange: { startDate: '2026-07-01', endDate: '2026-07-31' },
    };

    const insight = await generator.generate(request);

    // Should only fetch report for the filtered campaign
    expect(mockPoemoraClient.getReport).toHaveBeenCalledTimes(1);
    expect(mockPoemoraClient.getReport).toHaveBeenCalledWith('camp-1', request.dateRange);
    expect(insight.summary).toBeDefined();
  });

  it('should handle empty campaigns gracefully', async () => {
    mockPoemoraClient.getCampaigns.mockResolvedValue([]);

    const request: InsightRequest = {
      dateRange: { startDate: '2026-07-01', endDate: '2026-07-31' },
    };

    const insight = await generator.generate(request);

    expect(insight.summary).toBe('No campaigns found for the specified criteria.');
    expect(insight.recommendations).toEqual([]);
    expect(insight.highlights).toEqual([]);
    expect(insight.generatedAt).toBeDefined();
    expect(mockGenerateText).not.toHaveBeenCalled();
  });

  it('should handle empty campaigns when campaignIds filter matches nothing', async () => {
    mockPoemoraClient.getCampaigns.mockResolvedValue([
      activeCampaign,
      pausedCampaign,
    ]);

    const request: InsightRequest = {
      campaignIds: ['nonexistent-id'],
      dateRange: { startDate: '2026-07-01', endDate: '2026-07-31' },
    };

    const insight = await generator.generate(request);

    expect(insight.summary).toBe('No campaigns found for the specified criteria.');
    expect(insight.recommendations).toEqual([]);
    expect(insight.highlights).toEqual([]);
    expect(mockGenerateText).not.toHaveBeenCalled();
  });

  it('should use correct focus in system prompt', async () => {
    mockPoemoraClient.getCampaigns.mockResolvedValue([activeCampaign]);
    mockPoemoraClient.getReport.mockResolvedValueOnce(report1);
    mockGenerateText.mockResolvedValue({ text: MOCK_AI_RESPONSE });

    const request: InsightRequest = {
      dateRange: { startDate: '2026-07-01', endDate: '2026-07-31' },
      focus: 'budget',
    };

    await generator.generate(request);

    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining('budget utilization'),
      })
    );
  });

  it('should use overall focus when no focus specified', async () => {
    mockPoemoraClient.getCampaigns.mockResolvedValue([activeCampaign]);
    mockPoemoraClient.getReport.mockResolvedValueOnce(report1);
    mockGenerateText.mockResolvedValue({ text: MOCK_AI_RESPONSE });

    const request: InsightRequest = {
      dateRange: { startDate: '2026-07-01', endDate: '2026-07-31' },
    };

    await generator.generate(request);

    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining('comprehensive overview'),
      })
    );
  });

  it('should use performance focus in system prompt', async () => {
    mockPoemoraClient.getCampaigns.mockResolvedValue([activeCampaign]);
    mockPoemoraClient.getReport.mockResolvedValueOnce(report1);
    mockGenerateText.mockResolvedValue({ text: MOCK_AI_RESPONSE });

    const request: InsightRequest = {
      dateRange: { startDate: '2026-07-01', endDate: '2026-07-31' },
      focus: 'performance',
    };

    await generator.generate(request);

    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining('campaign performance metrics'),
      })
    );
  });

  it('should use audience focus in system prompt', async () => {
    mockPoemoraClient.getCampaigns.mockResolvedValue([activeCampaign]);
    mockPoemoraClient.getReport.mockResolvedValueOnce(report1);
    mockGenerateText.mockResolvedValue({ text: MOCK_AI_RESPONSE });

    const request: InsightRequest = {
      dateRange: { startDate: '2026-07-01', endDate: '2026-07-31' },
      focus: 'audience',
    };

    await generator.generate(request);

    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining('audience-related metrics'),
      })
    );
  });

  it('should return properly structured Insight object', async () => {
    mockPoemoraClient.getCampaigns.mockResolvedValue([activeCampaign]);
    mockPoemoraClient.getReport.mockResolvedValueOnce(report1);
    mockGenerateText.mockResolvedValue({ text: MOCK_AI_RESPONSE });

    const request: InsightRequest = {
      dateRange: { startDate: '2026-07-01', endDate: '2026-07-31' },
    };

    const insight = await generator.generate(request);

    // Verify structure
    expect(typeof insight.summary).toBe('string');
    expect(Array.isArray(insight.recommendations)).toBe(true);
    expect(Array.isArray(insight.highlights)).toBe(true);
    expect(typeof insight.generatedAt).toBe('string');

    // Verify highlights structure
    for (const highlight of insight.highlights) {
      expect(typeof highlight.campaignId).toBe('string');
      expect(typeof highlight.campaignName).toBe('string');
      expect(typeof highlight.metric).toBe('string');
      expect(typeof highlight.value).toBe('number');
      expect(['up', 'down', 'stable']).toContain(highlight.trend);
    }
  });

  it('should set generatedAt to current ISO date', async () => {
    const now = new Date('2026-07-15T12:00:00.000Z');
    vi.setSystemTime(now);

    mockPoemoraClient.getCampaigns.mockResolvedValue([activeCampaign]);
    mockPoemoraClient.getReport.mockResolvedValueOnce(report1);
    mockGenerateText.mockResolvedValue({ text: MOCK_AI_RESPONSE });

    const request: InsightRequest = {
      dateRange: { startDate: '2026-07-01', endDate: '2026-07-31' },
    };

    const insight = await generator.generate(request);

    expect(insight.generatedAt).toBe('2026-07-15T12:00:00.000Z');

    vi.useRealTimers();
  });

  it('should handle non-JSON AI response gracefully', async () => {
    mockPoemoraClient.getCampaigns.mockResolvedValue([activeCampaign]);
    mockPoemoraClient.getReport.mockResolvedValueOnce(report1);
    mockGenerateText.mockResolvedValue({
      text: 'This is a plain text response without JSON.',
    });

    const request: InsightRequest = {
      dateRange: { startDate: '2026-07-01', endDate: '2026-07-31' },
    };

    const insight = await generator.generate(request);

    expect(insight.summary).toBe('This is a plain text response without JSON.');
    expect(insight.recommendations).toEqual([]);
    expect(insight.highlights).toEqual([]);
  });

  it('should pass campaign data as prompt to generateText', async () => {
    mockPoemoraClient.getCampaigns.mockResolvedValue([activeCampaign]);
    mockPoemoraClient.getReport.mockResolvedValueOnce(report1);
    mockGenerateText.mockResolvedValue({ text: MOCK_AI_RESPONSE });

    const request: InsightRequest = {
      dateRange: { startDate: '2026-07-01', endDate: '2026-07-31' },
    };

    await generator.generate(request);

    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining('Summer Sale 2026'),
        maxOutputTokens: 4096,
      })
    );
  });
});
