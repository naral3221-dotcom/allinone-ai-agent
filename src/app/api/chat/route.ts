import { streamText } from 'ai';
import { models } from '@/lib/ai/providers';
import type { ModelId } from '@/lib/ai/models';
import { MODEL_REGISTRY } from '@/lib/ai/models';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { conversationService } from '@/lib/db';
import { RAGPipeline } from '@/lib/rag/pipeline';

const ragPipeline = new RAGPipeline();

export const maxDuration = 60;

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { messages, modelId = 'claude-sonnet', conversationId, knowledgeBaseId } =
    await request.json();

  const modelInfo = MODEL_REGISTRY[modelId as ModelId];
  if (!modelInfo) {
    return new Response(JSON.stringify({ error: 'Invalid model' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const model = models[modelId as keyof typeof models];

  // Save user message to DB if conversationId provided
  const lastUserMessage = messages[messages.length - 1];
  if (conversationId && conversationId !== 'new' && lastUserMessage?.role === 'user') {
    await conversationService.addMessage(conversationId, {
      role: 'user',
      content: lastUserMessage.content,
    });
  }

  // RAG context retrieval
  let system: string | undefined;
  if (knowledgeBaseId) {
    const contexts = await ragPipeline.retrieveContext({
      query: lastUserMessage?.content ?? '',
      knowledgeBaseId,
    });
    if (contexts.length > 0) {
      system = 'Use the following context to answer the user\'s question:\n\n' +
        contexts.map(c => c.content).join('\n---\n') + '\n\n' +
        'If the context is not relevant, you may answer from your general knowledge.';
    }
  }

  const result = streamText({
    model,
    system,
    messages,
    maxTokens: modelInfo.maxOutput,
    async onFinish({ text, usage }) {
      // Save assistant message to DB
      if (conversationId && conversationId !== 'new') {
        await conversationService.addMessage(conversationId, {
          role: 'assistant',
          content: text,
          model: modelId,
          metadata: {
            inputTokens: usage.promptTokens,
            outputTokens: usage.completionTokens,
          },
        });

        // Auto-generate title from first message
        const conv = await conversationService.getConversation(
          conversationId,
          user.id
        );
        if (conv && !conv.title && messages.length <= 2) {
          const title =
            lastUserMessage.content.slice(0, 50) +
            (lastUserMessage.content.length > 50 ? '...' : '');
          await conversationService.updateConversationTitle(
            conversationId,
            title
          );
        }
      }

      // Log usage
      if (usage.promptTokens > 0) {
        const cost =
          (usage.promptTokens / 1000) * modelInfo.costPer1kInput +
          (usage.completionTokens / 1000) * modelInfo.costPer1kOutput;

        await conversationService.logUsage({
          userId: user.id,
          model: modelId,
          inputTokens: usage.promptTokens,
          outputTokens: usage.completionTokens,
          cost,
        });
      }
    },
  });

  return result.toDataStreamResponse();
}
