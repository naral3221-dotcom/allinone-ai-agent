import type { PlatformProvider } from './provider';
import type { Campaign, AdSet, MetricData, DateRange, CampaignReport, PlatformConfig } from './types';

export class PoemoraClient implements PlatformProvider {
  private config: PlatformConfig;

  constructor(config: PlatformConfig) {
    this.config = config;
  }

  private async request<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(path, this.config.baseUrl);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      throw new Error(`Poemora network error on ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }

    if (!response.ok) {
      if (response.status === 404) return null as T;
      throw new Error(`Poemora API error: ${response.status} on ${path}`);
    }

    return response.json();
  }

  async getCampaigns(): Promise<Campaign[]> {
    const data = await this.request<{ campaigns: Campaign[] }>('/api/campaigns');
    return data.campaigns ?? [];
  }

  async getCampaign(id: string): Promise<Campaign | null> {
    return this.request<Campaign | null>(`/api/campaigns/${id}`);
  }

  async getAdSets(campaignId: string): Promise<AdSet[]> {
    const data = await this.request<{ adSets: AdSet[] }>(`/api/campaigns/${campaignId}/adsets`);
    return data?.adSets ?? [];
  }

  async getMetrics(campaignId: string, dateRange: DateRange): Promise<MetricData[]> {
    const data = await this.request<{ metrics: MetricData[] }>(
      `/api/campaigns/${campaignId}/metrics`,
      { startDate: dateRange.startDate, endDate: dateRange.endDate }
    );
    return data.metrics ?? [];
  }

  async getReport(campaignId: string, dateRange: DateRange): Promise<CampaignReport> {
    return this.request<CampaignReport>(
      `/api/campaigns/${campaignId}/report`,
      { startDate: dateRange.startDate, endDate: dateRange.endDate }
    );
  }
}
