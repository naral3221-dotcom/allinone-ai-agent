import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { documentService } from '@/lib/db/document.service.singleton';

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

  const body = await request.json().catch(() => ({}));
  const { title, content, type, tags } = body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return jsonResponse({ error: 'title is required' }, 400);
  }

  const doc = await documentService.create({
    userId: user.id,
    title,
    content,
    type,
    ...(tags ? { tags } : {}),
  });

  return jsonResponse({ document: doc });
}

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const options: { type?: string } = {};
  if (type) options.type = type;

  const documents = await documentService.list(user.id, options);
  return jsonResponse({ documents });
}
