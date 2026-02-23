'use client';

import { useState, useEffect, useCallback } from 'react';
import { SummaryCards } from '@/components/marketing/summary-cards';
import { MetricsChart } from '@/components/marketing/metrics-chart';
import { CampaignTable } from '@/components/marketing/campaign-table';
import { InsightPanel } from '@/components/marketing/insight-panel';

interface SummaryData {
  totalCampaigns: number;
  activeCampaigns: number;
  totalBudget: number;
  totalSpent: number;
  avgCtr: number;
  avgRoas: number;
}

interface CampaignData {
  id: string;
  name: string;
  status: string;
  platform: string;
  budget: number;
  spent: number;
}

interface MetricPoint {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
}

interface InsightData {
  summary: string;
  recommendations: string[];
  generatedAt: string;
}

function getDefaultDateRange(): { startDate: string; endDate: string } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

export default function MarketingPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [metrics, setMetrics] = useState<MetricPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const dateRange = getDefaultDateRange();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [dashboardRes, campaignsRes, metricsRes] = await Promise.all([
          fetch(`/api/marketing/dashboard?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
          fetch('/api/marketing/campaigns'),
          fetch(`/api/marketing/metrics?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
        ]);

        if (dashboardRes.ok) {
          const dashboardData = await dashboardRes.json();
          setSummary({
            totalCampaigns: dashboardData.summary.totalCampaigns,
            activeCampaigns: dashboardData.summary.activeCampaigns,
            totalBudget: dashboardData.summary.totalBudget,
            totalSpent: dashboardData.summary.totalSpent,
            avgCtr: dashboardData.summary.metrics.avgCtr,
            avgRoas: dashboardData.summary.metrics.avgRoas,
          });
        }

        if (campaignsRes.ok) {
          const campaignsData = await campaignsRes.json();
          setCampaigns(campaignsData.campaigns);
        }

        if (metricsRes.ok) {
          const metricsData = await metricsRes.json();
          setMetrics(metricsData.metrics);
        }
      } catch {
        // Silently handle fetch errors; components show empty states
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [dateRange.startDate, dateRange.endDate]);

  const handleGenerateInsight = useCallback(async (): Promise<InsightData | null> => {
    try {
      const response = await fetch('/api/marketing/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateRange }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data.insight;
    } catch {
      return null;
    }
  }, [dateRange]);

  if (isLoading) {
    return (
      <div data-testid="marketing-loading" className="flex h-full items-center justify-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading marketing data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Marketing Dashboard</h1>

      {summary && <SummaryCards data={summary} />}

      <MetricsChart data={metrics} />

      <CampaignTable campaigns={campaigns} />

      <InsightPanel onGenerate={handleGenerateInsight} />
    </div>
  );
}
