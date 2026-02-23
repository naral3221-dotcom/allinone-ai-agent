import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { RAGPipeline } from '@/lib/rag/pipeline';

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const ragPipeline = new RAGPipeline();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const { id } = await params;
  const { query, topK, modelId } = await request.json();

  if (!query || typeof query !== 'string' || query.trim() === '') {
    return jsonResponse({ error: 'query is required' }, 400);
  }

  const result = await ragPipeline.query({
    query,
    knowledgeBaseId: id,
    topK,
    modelId,
  });

  return jsonResponse(result);
}
