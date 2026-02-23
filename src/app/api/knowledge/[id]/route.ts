import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { knowledgeBaseService } from '@/lib/db/knowledge.service.singleton';

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const { id } = await params;
  const kb = await knowledgeBaseService.getKnowledgeBase(id);

  if (!kb) {
    return jsonResponse({ error: 'Not found' }, 404);
  }

  return jsonResponse({ knowledgeBase: kb });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const { id } = await params;
  await knowledgeBaseService.deleteKnowledgeBase(id);

  return jsonResponse({ success: true });
}
