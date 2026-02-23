export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  platform: string;       // 'google' | 'meta' | 'tiktok' etc.
  budget: number;
  spent: number;
  startDate: string;
  endDate?: string;
}

export interface AdSet {
  id: string;
  campaignId: string;
  name: string;
  status: 'active' | 'paused';
  targetAudience: string;
  dailyBudget: number;
}

export interface MetricData {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  ctr: number;         // click-through rate
  cpc: number;         // cost per click
  roas: number;        // return on ad spend
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface PlatformConfig {
  baseUrl: string;
  apiKey: string;
}

export interface CampaignReport {
  campaign: Campaign;
  metrics: MetricData[];
  summary: {
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    totalSpend: number;
    totalRevenue: number;
    avgCtr: number;
    avgRoas: number;
  };
}
