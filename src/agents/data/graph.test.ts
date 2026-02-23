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

import { classifyAnalysis, analyzeData } from './nodes';
import type { DataStateType } from './state';

function makeState(overrides: Partial<DataStateType> = {}): DataStateType {
  return {
    messages: [{ role: 'user', content: 'Analyze this sales data' }],
    query: 'Analyze this sales data',
    analysisType: 'summarize',
    dataInput: 'Q1: $100k, Q2: $150k, Q3: $130k, Q4: $200k',
    analysisOutput: '',
    chartSuggestion: '',
    isComplete: false,
    ...overrides,
  };
}

describe('Data Agent Nodes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('classifyAnalysis', () => {
    it('should classify as summarize', async () => {
      mockGenerateText.mockResolvedValue({ text: 'summarize' });
      const result = await classifyAnalysis(makeState());
      expect(result.analysisType).toBe('summarize');
    });

    it('should classify as statistics', async () => {
      mockGenerateText.mockResolvedValue({ text: 'statistics' });
      const result = await classifyAnalysis(
        makeState({ query: 'Calculate the mean and standard deviation' })
      );
      expect(result.analysisType).toBe('statistics');
    });

    it('should classify as visualize', async () => {
      mockGenerateText.mockResolvedValue({ text: 'visualize' });
      const result = await classifyAnalysis(
        makeState({ query: 'Create a chart for this data' })
      );
      expect(result.analysisType).toBe('visualize');
    });

    it('should classify as transform', async () => {
      mockGenerateText.mockResolvedValue({ text: 'transform' });
      const result = await classifyAnalysis(
        makeState({ query: 'Clean and normalize this dataset' })
      );
      expect(result.analysisType).toBe('transform');
    });

    it('should classify as compare', async () => {
      mockGenerateText.mockResolvedValue({ text: 'compare' });
      const result = await classifyAnalysis(
        makeState({ query: 'Compare Q1 vs Q2 sales' })
      );
      expect(result.analysisType).toBe('compare');
    });

    it('should fallback to summarize for invalid', async () => {
      mockGenerateText.mockResolvedValue({ text: 'invalid' });
      const result = await classifyAnalysis(makeState());
      expect(result.analysisType).toBe('summarize');
    });
  });

  describe('analyzeData', () => {
    it('should analyze data and mark complete', async () => {
      mockGenerateText.mockResolvedValue({
        text: 'The sales data shows a general upward trend with Q4 being the strongest quarter.',
      });

      const result = await analyzeData(makeState());
      expect(result.analysisOutput).toContain('upward trend');
      expect(result.isComplete).toBe(true);
      expect(result.messages).toHaveLength(1);
    });

    it('should use type-specific system prompt', async () => {
      mockGenerateText.mockResolvedValue({ text: 'statistical analysis result' });
      await analyzeData(makeState({ analysisType: 'statistics' }));

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          system: expect.stringContaining('statistical analyst'),
        })
      );
    });

    it('should set chartSuggestion for visualize type', async () => {
      const visualizeOutput =
        'Use a bar chart to compare quarterly sales. {"type":"bar","xAxis":"quarter","yAxis":"revenue"}';
      mockGenerateText.mockResolvedValue({ text: visualizeOutput });

      const result = await analyzeData(makeState({ analysisType: 'visualize' }));
      expect(result.chartSuggestion).toBe(visualizeOutput);
      expect(result.analysisOutput).toBe(visualizeOutput);
      expect(result.isComplete).toBe(true);
    });
  });
});

describe('Data Graph', () => {
  it('should compile without errors', async () => {
    const { createDataGraph } = await import('./graph');
    const graph = createDataGraph();
    expect(graph).toBeDefined();
    expect(graph.invoke).toBeDefined();
  });
});
