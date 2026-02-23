import { Annotation } from '@langchain/langgraph';

export type ContentType = 'document' | 'email' | 'report' | 'summary' | 'blog';

export const ContentState = Annotation.Root({
  messages: Annotation<Array<{ role: string; content: string }>>({
    reducer: (left, right) => {
      if (Array.isArray(right)) return left.concat(right);
      return left.concat([right]);
    },
    default: () => [],
  }),
  query: Annotation<string>,
  contentType: Annotation<ContentType>({
    default: () => 'document' as ContentType,
  }),
  tone: Annotation<string>({
    default: () => 'professional',
  }),
  contentOutput: Annotation<string>({
    default: () => '',
  }),
  isComplete: Annotation<boolean>({
    default: () => false,
  }),
});

export type ContentStateType = typeof ContentState.State;
