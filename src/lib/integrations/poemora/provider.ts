import type { Campaign, AdSet, MetricData, DateRange, CampaignReport } from './types';

export interface PlatformProvider {
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | null>;
  getAdSets(campaignId: string): Promise<AdSet[]>;
  getMetrics(campaignId: string, dateRange: DateRange): Promise<MetricData[]>;
  getReport(campaignId: string, dateRange: DateRange): Promise<CampaignReport>;
}
