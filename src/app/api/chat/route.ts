import { streamText } from 'ai';
import { models } from '@/lib/ai/providers';
import type { ModelId } from '@/lib/ai/models';
import { MODEL_REGISTRY } from '@/lib/ai/models';

export const maxDuration = 60;

export async function POST(request: Request) {
  const { messages, modelId = 'claude-sonnet' } = await request.json();

  const modelInfo = MODEL_REGISTRY[modelId as ModelId];
  if (!modelInfo) {
    return new Response(JSON.stringify({ error: 'Invalid model' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const model = models[modelId as keyof typeof models];

  const result = streamText({
    model,
    messages,
    maxTokens: modelInfo.maxOutput,
  });

  return result.toDataStreamResponse();
}
