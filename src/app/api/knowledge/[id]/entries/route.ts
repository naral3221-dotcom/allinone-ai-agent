import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { knowledgeBaseService } from '@/lib/db/knowledge.service.singleton';

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const { id } = await params;
  const { title, content, sourceType = 'text', sourceUrl } = await request.json();

  if (!title || !content) {
    return jsonResponse({ error: 'title and content are required' }, 400);
  }

  const result = await knowledgeBaseService.addEntry({
    knowledgeBaseId: id,
    title,
    content,
    sourceType,
    sourceUrl,
  });

  return jsonResponse(result);
}
