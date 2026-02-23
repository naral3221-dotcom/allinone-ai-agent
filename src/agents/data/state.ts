import { Annotation } from '@langchain/langgraph';

export type AnalysisType = 'summarize' | 'statistics' | 'visualize' | 'transform' | 'compare';

export const DataState = Annotation.Root({
  messages: Annotation<Array<{ role: string; content: string }>>({
    reducer: (left, right) => {
      if (Array.isArray(right)) return left.concat(right);
      return left.concat([right]);
    },
    default: () => [],
  }),
  query: Annotation<string>,
  analysisType: Annotation<AnalysisType>({
    default: () => 'summarize' as AnalysisType,
  }),
  dataInput: Annotation<string>({
    default: () => '',
  }),
  analysisOutput: Annotation<string>({
    default: () => '',
  }),
  chartSuggestion: Annotation<string>({
    default: () => '',
  }),
  isComplete: Annotation<boolean>({
    default: () => false,
  }),
});

export type DataStateType = typeof DataState.State;
