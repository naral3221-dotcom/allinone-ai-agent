'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@/lib/utils/cn';

interface MarkdownMessageProps {
  content: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
}

export function MarkdownMessage({ content, role }: MarkdownMessageProps) {
  if (role === 'user') {
    return <p className="whitespace-pre-wrap">{content}</p>;
  }

  return (
    <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre({ children, ...props }) {
            return (
              <pre
                className="overflow-x-auto rounded-md bg-zinc-900 p-3 text-sm text-zinc-100 dark:bg-zinc-800"
                {...props}
              >
                {children}
              </pre>
            );
          },
          code({ children, className, ...props }) {
            const isInline = !className;
            return (
              <code
                className={cn(
                  isInline &&
                    'rounded bg-zinc-200 px-1 py-0.5 text-sm dark:bg-zinc-700'
                )}
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
