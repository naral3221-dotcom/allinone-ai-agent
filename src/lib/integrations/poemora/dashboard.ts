import type { PlatformProvider } from './provider';
import type { Campaign, DateRange, MetricData, CampaignReport } from './types';

export interface DashboardSummary {
  totalCampaigns: number;
  activeCampaigns: number;
  totalBudget: number;
  totalSpent: number;
  metrics: {
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
    avgCtr: number;
    avgRoas: number;
  };
}

export interface MetricsComparison {
  campaigns: Array<{
    campaignId: string;
    campaignName: string;
    metrics: MetricData[];
  }>;
}

export class DashboardService {
  private client: PlatformProvider;

  constructor(client: PlatformProvider) {
    this.client = client;
  }

  async getDashboardSummary(dateRange: DateRange): Promise<DashboardSummary> {
    const campaigns = await this.client.getCampaigns();

    if (campaigns.length === 0) {
      return {
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalBudget: 0,
        totalSpent: 0,
        metrics: {
          totalImpressions: 0,
          totalClicks: 0,
          totalConversions: 0,
          totalRevenue: 0,
          avgCtr: 0,
          avgRoas: 0,
        },
      };
    }

    const reports = await Promise.all(
      campaigns.map((c) => this.client.getReport(c.id, dateRange))
    );

    const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
    const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
    const activeCampaigns = campaigns.filter((c) => c.status === 'active').length;

    let totalImpressions = 0;
    let totalClicks = 0;
    let totalConversions = 0;
    let totalRevenue = 0;
    let totalReportSpend = 0;

    for (const report of reports) {
      totalImpressions += report.summary.totalImpressions;
      totalClicks += report.summary.totalClicks;
      totalConversions += report.summary.totalConversions;
      totalRevenue += report.summary.totalRevenue;
      totalReportSpend += report.summary.totalSpend;
    }

    const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
    const avgRoas = totalReportSpend > 0 ? totalRevenue / totalReportSpend : 0;

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns,
      totalBudget,
      totalSpent,
      metrics: {
        totalImpressions,
        totalClicks,
        totalConversions,
        totalRevenue,
        avgCtr,
        avgRoas,
      },
    };
  }

  async getMetricsComparison(
    campaignIds: string[],
    dateRange: DateRange
  ): Promise<MetricsComparison> {
    if (campaignIds.length === 0) {
      return { campaigns: [] };
    }

    const results = await Promise.all(
      campaignIds.map(async (id) => {
        const [campaign, metrics] = await Promise.all([
          this.client.getCampaign(id),
          this.client.getMetrics(id, dateRange),
        ]);
        return {
          campaignId: id,
          campaignName: campaign?.name ?? '',
          metrics,
        };
      })
    );

    return { campaigns: results };
  }

  async getTopCampaigns(
    dateRange: DateRange,
    limit = 5
  ): Promise<Campaign[]> {
    const campaigns = await this.client.getCampaigns();

    if (campaigns.length === 0) {
      return [];
    }

    const reports = await Promise.all(
      campaigns.map((c) => this.client.getReport(c.id, dateRange))
    );

    const campaignsWithRoas = campaigns.map((campaign, index) => ({
      campaign,
      roas: reports[index].summary.avgRoas,
    }));

    campaignsWithRoas.sort((a, b) => b.roas - a.roas);

    return campaignsWithRoas.slice(0, limit).map((item) => item.campaign);
  }
}
