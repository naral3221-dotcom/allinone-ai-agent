import { Annotation } from '@langchain/langgraph';

export type MarketingAnalysisType =
  | 'campaign-analysis'
  | 'ad-performance'
  | 'budget-optimization'
  | 'audience-insight'
  | 'competitor-report';

export const MarketingState = Annotation.Root({
  messages: Annotation<Array<{ role: string; content: string }>>({
    value: (left, right) => {
      if (Array.isArray(right)) return left.concat(right);
      return left.concat([right]);
    },
    default: () => [],
  }),
  query: Annotation<string>,
  analysisType: Annotation<MarketingAnalysisType>({
    value: (_, b) => b,
    default: () => 'campaign-analysis' as MarketingAnalysisType,
  }),
  campaignData: Annotation<string>({
    value: (_, b) => b,
    default: () => '',
  }),
  insight: Annotation<string>({
    value: (_, b) => b,
    default: () => '',
  }),
  recommendations: Annotation<string>({
    value: (_, b) => b,
    default: () => '',
  }),
  isComplete: Annotation<boolean>({
    value: (_, b) => b,
    default: () => false,
  }),
});

export type MarketingStateType = typeof MarketingState.State;
