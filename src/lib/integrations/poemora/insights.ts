import { generateText } from 'ai';
import { models } from '@/lib/ai/providers';
import type { PlatformProvider } from './provider';
import type { DateRange, CampaignReport } from './types';

export interface InsightRequest {
  campaignIds?: string[];
  dateRange: DateRange;
  focus?: 'performance' | 'budget' | 'audience' | 'overall';
}

export interface InsightHighlight {
  campaignId: string;
  campaignName: string;
  metric: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
}

export interface Insight {
  summary: string;
  recommendations: string[];
  highlights: InsightHighlight[];
  generatedAt: string;
}

const FOCUS_INSTRUCTIONS: Record<string, string> = {
  performance:
    'Focus your analysis on campaign performance metrics: impressions, clicks, conversions, CTR, and ROAS.',
  budget:
    'Focus your analysis on budget utilization: spend vs budget, cost efficiency, CPC, and budget allocation recommendations.',
  audience:
    'Focus your analysis on audience-related metrics: reach (impressions), engagement (clicks, CTR), and conversion patterns.',
  overall:
    'Provide a comprehensive overview covering performance, budget efficiency, and key trends across all metrics.',
};

function buildDataSummary(reports: CampaignReport[]): string {
  return reports
    .map((report) => {
      const { campaign, summary } = report;
      return [
        `Campaign: ${campaign.name} (ID: ${campaign.id})`,
        `  Platform: ${campaign.platform} | Status: ${campaign.status}`,
        `  Budget: $${campaign.budget} | Spent: $${campaign.spent}`,
        `  Impressions: ${summary.totalImpressions} | Clicks: ${summary.totalClicks}`,
        `  Conversions: ${summary.totalConversions} | Revenue: $${summary.totalRevenue}`,
        `  CTR: ${(summary.avgCtr * 100).toFixed(2)}% | ROAS: ${summary.avgRoas.toFixed(2)}`,
      ].join('\n');
    })
    .join('\n\n');
}

function parseInsightResponse(text: string): {
  summary: string;
  recommendations: string[];
  highlights: InsightHighlight[];
} {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { summary: text, recommendations: [], highlights: [] };
    }
    const parsed: unknown = JSON.parse(jsonMatch[0]);
    if (typeof parsed !== 'object' || parsed === null) {
      return { summary: text, recommendations: [], highlights: [] };
    }
    const obj = parsed as Record<string, unknown>;

    const summary = typeof obj['summary'] === 'string' ? obj['summary'] : text;

    const recommendations = Array.isArray(obj['recommendations'])
      ? (obj['recommendations'] as unknown[]).filter(
          (r): r is string => typeof r === 'string'
        )
      : [];

    const highlights = Array.isArray(obj['highlights'])
      ? (obj['highlights'] as unknown[])
          .filter(
            (h): h is Record<string, unknown> =>
              typeof h === 'object' && h !== null
          )
          .map((h) => ({
            campaignId: String(h['campaignId'] ?? ''),
            campaignName: String(h['campaignName'] ?? ''),
            metric: String(h['metric'] ?? ''),
            value: typeof h['value'] === 'number' ? h['value'] : 0,
            trend: (['up', 'down', 'stable'].includes(String(h['trend']))
              ? String(h['trend'])
              : 'stable') as 'up' | 'down' | 'stable',
          }))
      : [];

    return { summary, recommendations, highlights };
  } catch {
    return { summary: text, recommendations: [], highlights: [] };
  }
}

export class InsightGenerator {
  constructor(private client: PlatformProvider) {}

  async generate(request: InsightRequest): Promise<Insight> {
    const focus = request.focus ?? 'overall';

    const allCampaigns = await this.client.getCampaigns();

    const campaigns = request.campaignIds
      ? allCampaigns.filter((c) => request.campaignIds!.includes(c.id))
      : allCampaigns;

    if (campaigns.length === 0) {
      return {
        summary: 'No campaigns found for the specified criteria.',
        recommendations: [],
        highlights: [],
        generatedAt: new Date().toISOString(),
      };
    }

    const reports = await Promise.all(
      campaigns.map((c) => this.client.getReport(c.id, request.dateRange))
    );

    const dataSummary = buildDataSummary(reports);

    const systemPrompt = [
      'You are a marketing analytics expert. Analyze the following campaign data and produce actionable insights.',
      FOCUS_INSTRUCTIONS[focus],
      'Return your response as valid JSON with the following structure:',
      '{ "summary": "string", "recommendations": ["string"], "highlights": [{ "campaignId": "string", "campaignName": "string", "metric": "string", "value": number, "trend": "up" | "down" | "stable" }] }',
      'Return ONLY the JSON object, no additional text.',
    ].join('\n');

    const { text } = await generateText({
      model: models['claude-sonnet'],
      system: systemPrompt,
      prompt: dataSummary,
      maxTokens: 4096,
    });

    const parsed = parseInsightResponse(text);

    return {
      ...parsed,
      generatedAt: new Date().toISOString(),
    };
  }
}
