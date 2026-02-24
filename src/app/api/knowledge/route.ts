import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { knowledgeBaseService } from '@/lib/db/knowledge.service.singleton';

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const { name, description } = await request.json();

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return jsonResponse({ error: 'name is required' }, 400);
  }

  const kb = await knowledgeBaseService.createKnowledgeBase(user.id, name, description);
  return jsonResponse({ knowledgeBase: kb });
}

export async function GET(_request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const knowledgeBases = await knowledgeBaseService.listKnowledgeBases(user.id);
  return jsonResponse({ knowledgeBases });
}
