import { Annotation } from '@langchain/langgraph';

export type AnalysisType = 'summarize' | 'statistics' | 'visualize' | 'transform' | 'compare';

export const DataState = Annotation.Root({
  messages: Annotation<Array<{ role: string; content: string }>>({
    value: (left, right) => {
      if (Array.isArray(right)) return left.concat(right);
      return left.concat([right]);
    },
    default: () => [],
  }),
  query: Annotation<string>,
  analysisType: Annotation<AnalysisType>({
    value: (_, b) => b,
    default: () => 'summarize' as AnalysisType,
  }),
  dataInput: Annotation<string>({
    value: (_, b) => b,
    default: () => '',
  }),
  analysisOutput: Annotation<string>({
    value: (_, b) => b,
    default: () => '',
  }),
  chartSuggestion: Annotation<string>({
    value: (_, b) => b,
    default: () => '',
  }),
  isComplete: Annotation<boolean>({
    value: (_, b) => b,
    default: () => false,
  }),
});

export type DataStateType = typeof DataState.State;
