import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { documentService } from '@/lib/db/document.service.singleton';

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
  const doc = await documentService.get(id);

  if (!doc) {
    return jsonResponse({ error: 'Not found' }, 404);
  }

  return jsonResponse({ document: doc });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { title, content, tags } = body;

  const input: { title?: string; content?: unknown; tags?: string[] } = {};
  if (title !== undefined) input.title = title;
  if (content !== undefined) input.content = content;
  if (tags !== undefined) input.tags = tags;

  const doc = await documentService.update(id, input);
  return jsonResponse({ document: doc });
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
  await documentService.delete(id);

  return jsonResponse({ success: true });
}
