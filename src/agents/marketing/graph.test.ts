import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGenerateText } = vi.hoisted(() => ({
  mockGenerateText: vi.fn(),
}));

vi.mock('ai', () => ({
  generateText: mockGenerateText,
}));

vi.mock('@/lib/ai/providers', () => ({
  models: {
    'claude-haiku': { modelId: 'claude-haiku' },
    'claude-sonnet': { modelId: 'claude-sonnet' },
  },
}));

import { classifyIntent, analyzeMarketing } from './nodes';
import type { MarketingStateType } from './state';

function makeState(overrides: Partial<MarketingStateType> = {}): MarketingStateType {
  return {
    messages: [{ role: 'user', content: 'Analyze my Google Ads campaign performance' }],
    query: 'Analyze my Google Ads campaign performance',
    analysisType: 'campaign-analysis',
    campaignData: '',
    insight: '',
    recommendations: '',
    isComplete: false,
    ...overrides,
  };
}

describe('Marketing Agent Nodes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('classifyIntent', () => {
    it('should classify as campaign-analysis', async () => {
      mockGenerateText.mockResolvedValue({ text: 'campaign-analysis' });
      const result = await classifyIntent(makeState());
      expect(result.analysisType).toBe('campaign-analysis');
    });

    it('should classify as ad-performance', async () => {
      mockGenerateText.mockResolvedValue({ text: 'ad-performance' });
      const result = await classifyIntent(
        makeState({ query: 'What is the CTR and CPC of my ads?' })
      );
      expect(result.analysisType).toBe('ad-performance');
    });

    it('should classify as budget-optimization', async () => {
      mockGenerateText.mockResolvedValue({ text: 'budget-optimization' });
      const result = await classifyIntent(
        makeState({ query: 'How should I reallocate my ad budget?' })
      );
      expect(result.analysisType).toBe('budget-optimization');
    });

    it('should classify as audience-insight', async () => {
      mockGenerateText.mockResolvedValue({ text: 'audience-insight' });
      const result = await classifyIntent(
        makeState({ query: 'Who is my target audience for this campaign?' })
      );
      expect(result.analysisType).toBe('audience-insight');
    });

    it('should classify as competitor-report', async () => {
      mockGenerateText.mockResolvedValue({ text: 'competitor-report' });
      const result = await classifyIntent(
        makeState({ query: 'Compare my campaign performance against competitors' })
      );
      expect(result.analysisType).toBe('competitor-report');
    });

    it('should fallback to campaign-analysis for invalid type', async () => {
      mockGenerateText.mockResolvedValue({ text: 'invalid-type' });
      const result = await classifyIntent(makeState());
      expect(result.analysisType).toBe('campaign-analysis');
    });

    it('should trim and lowercase the LLM response', async () => {
      mockGenerateText.mockResolvedValue({ text: '  Ad-Performance  ' });
      const result = await classifyIntent(makeState());
      expect(result.analysisType).toBe('ad-performance');
    });
  });

  describe('analyzeMarketing', () => {
    it('should generate insight and recommendations and mark complete', async () => {
      const responseText =
        'Campaign shows strong CTR of 3.2%. Recommendation: Increase budget for top-performing ad sets.';
      mockGenerateText.mockResolvedValue({ text: responseText });

      const result = await analyzeMarketing(makeState());
      expect(result.insight).toContain('CTR');
      expect(result.recommendations).toContain('CTR');
      expect(result.isComplete).toBe(true);
      expect(result.messages).toHaveLength(1);
      expect(result.messages![0].role).toBe('assistant');
    });

    it('should use campaign-analysis system prompt', async () => {
      mockGenerateText.mockResolvedValue({ text: 'analysis result' });
      await analyzeMarketing(makeState({ analysisType: 'campaign-analysis' }));

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          system: expect.stringContaining('marketing campaign analyst'),
        })
      );
    });

    it('should use ad-performance system prompt', async () => {
      mockGenerateText.mockResolvedValue({ text: 'ad metrics result' });
      await analyzeMarketing(makeState({ analysisType: 'ad-performance' }));

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          system: expect.stringContaining('ad performance specialist'),
        })
      );
    });

    it('should use budget-optimization system prompt', async () => {
      mockGenerateText.mockResolvedValue({ text: 'budget result' });
      await analyzeMarketing(makeState({ analysisType: 'budget-optimization' }));

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          system: expect.stringContaining('budget optimization expert'),
        })
      );
    });

    it('should use audience-insight system prompt', async () => {
      mockGenerateText.mockResolvedValue({ text: 'audience result' });
      await analyzeMarketing(makeState({ analysisType: 'audience-insight' }));

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          system: expect.stringContaining('audience analysis expert'),
        })
      );
    });

    it('should use competitor-report system prompt', async () => {
      mockGenerateText.mockResolvedValue({ text: 'competitor result' });
      await analyzeMarketing(makeState({ analysisType: 'competitor-report' }));

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          system: expect.stringContaining('competitive intelligence analyst'),
        })
      );
    });

    it('should include campaignData in system prompt when available', async () => {
      const campaignData = JSON.stringify({
        impressions: 50000,
        clicks: 1500,
        conversions: 120,
        spend: 2500,
      });
      mockGenerateText.mockResolvedValue({ text: 'data-driven insight' });

      await analyzeMarketing(makeState({ campaignData }));

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          system: expect.stringContaining(campaignData),
        })
      );
    });

    it('should not include campaign data section when campaignData is empty', async () => {
      mockGenerateText.mockResolvedValue({ text: 'general insight' });

      await analyzeMarketing(makeState({ campaignData: '' }));

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          system: expect.not.stringContaining('Campaign Data:'),
        })
      );
    });
  });
});

describe('Marketing Graph', () => {
  it('should compile without errors', async () => {
    const { createMarketingGraph } = await import('./graph');
    const graph = createMarketingGraph();
    expect(graph).toBeDefined();
    expect(graph.invoke).toBeDefined();
  });
});
