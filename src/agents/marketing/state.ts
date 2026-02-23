import { Annotation } from '@langchain/langgraph';

export type MarketingAnalysisType =
  | 'campaign-analysis'
  | 'ad-performance'
  | 'budget-optimization'
  | 'audience-insight'
  | 'competitor-report';

export const MarketingState = Annotation.Root({
  messages: Annotation<Array<{ role: string; content: string }>>({
    reducer: (left, right) => {
      if (Array.isArray(right)) return left.concat(right);
      return left.concat([right]);
    },
    default: () => [],
  }),
  query: Annotation<string>,
  analysisType: Annotation<MarketingAnalysisType>({
    default: () => 'campaign-analysis' as MarketingAnalysisType,
  }),
  campaignData: Annotation<string>({
    default: () => '',
  }),
  insight: Annotation<string>({
    default: () => '',
  }),
  recommendations: Annotation<string>({
    default: () => '',
  }),
  isComplete: Annotation<boolean>({
    default: () => false,
  }),
});

export type MarketingStateType = typeof MarketingState.State;
