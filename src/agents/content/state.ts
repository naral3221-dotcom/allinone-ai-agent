import { Annotation } from '@langchain/langgraph';

export type ContentType = 'document' | 'email' | 'report' | 'summary' | 'blog';

export const ContentState = Annotation.Root({
  messages: Annotation<Array<{ role: string; content: string }>>({
    value: (left, right) => {
      if (Array.isArray(right)) return left.concat(right);
      return left.concat([right]);
    },
    default: () => [],
  }),
  query: Annotation<string>,
  contentType: Annotation<ContentType>({
    value: (_, b) => b,
    default: () => 'document' as ContentType,
  }),
  tone: Annotation<string>({
    value: (_, b) => b,
    default: () => 'professional',
  }),
  contentOutput: Annotation<string>({
    value: (_, b) => b,
    default: () => '',
  }),
  isComplete: Annotation<boolean>({
    value: (_, b) => b,
    default: () => false,
  }),
});

export type ContentStateType = typeof ContentState.State;
