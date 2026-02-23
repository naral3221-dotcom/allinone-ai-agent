import { generateText } from 'ai';
import { models } from '@/lib/ai/providers';
import type { MarketingStateType, MarketingAnalysisType } from './state';

const INTENT_PROMPT = `Analyze the user's request and determine the type of marketing analysis needed.
The available analysis types are:
- campaign-analysis: Analyze overall campaign performance, KPIs, and trends
- ad-performance: Evaluate ad metrics such as CTR, CPC, ROAS, and conversion rates
- budget-optimization: Analyze spend allocation and suggest budget reallocation strategies
- audience-insight: Analyze target demographics, segments, and audience behavior
- competitor-report: Compare campaign performance against competitors and industry benchmarks

Respond with ONLY one of: campaign-analysis, ad-performance, budget-optimization, audience-insight, competitor-report`;

const SYSTEM_PROMPTS: Record<MarketingAnalysisType, string> = {
  'campaign-analysis':
    'You are a marketing campaign analyst. Analyze campaign performance data, identify trends, and provide actionable insights on KPIs such as impressions, clicks, conversions, and ROI.',
  'ad-performance':
    'You are an ad performance specialist. Evaluate ad metrics, CTR, CPC, ROAS, conversion rates, and provide detailed performance breakdowns with optimization suggestions.',
  'budget-optimization':
    'You are a budget optimization expert. Analyze spend allocation and suggest budget reallocation strategies to maximize ROI across campaigns and channels.',
  'audience-insight':
    'You are an audience analysis expert. Analyze target demographics, audience segments, behavior patterns, and provide recommendations for better targeting.',
  'competitor-report':
    'You are a competitive intelligence analyst. Compare performance metrics against competitors, identify market positioning gaps, and suggest competitive strategies.',
};

export async function classifyIntent(
  state: MarketingStateType
): Promise<Partial<MarketingStateType>> {
  const { text } = await generateText({
    model: models['claude-haiku'],
    system: INTENT_PROMPT,
    prompt: state.query,
    maxTokens: 30,
  });

  const analysisType = text.trim().toLowerCase() as MarketingAnalysisType;
  const validTypes: MarketingAnalysisType[] = [
    'campaign-analysis',
    'ad-performance',
    'budget-optimization',
    'audience-insight',
    'competitor-report',
  ];

  return {
    analysisType: validTypes.includes(analysisType) ? analysisType : 'campaign-analysis',
  };
}

export async function analyzeMarketing(
  state: MarketingStateType
): Promise<Partial<MarketingStateType>> {
  let system = SYSTEM_PROMPTS[state.analysisType];

  if (state.campaignData) {
    system += `\n\nCampaign Data:\n${state.campaignData}`;
  }

  const { text } = await generateText({
    model: models['claude-sonnet'],
    system,
    messages: state.messages.map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    })),
    maxTokens: 4096,
  });

  return {
    insight: text,
    recommendations: text,
    isComplete: true,
    messages: [{ role: 'assistant', content: text }],
  };
}
