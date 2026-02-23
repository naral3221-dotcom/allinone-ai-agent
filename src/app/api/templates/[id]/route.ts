import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { promptTemplateService } from '@/lib/db/prompt-template.service.singleton';

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
  const template = await promptTemplateService.get(id);

  if (!template) {
    return jsonResponse({ error: 'Not found' }, 404);
  }

  return jsonResponse({ template });
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
  const { name, content, description, category, isPublic } = body;

  const input: {
    name?: string;
    content?: string;
    description?: string;
    category?: string;
    isPublic?: boolean;
  } = {};

  if (name !== undefined) input.name = name;
  if (content !== undefined) input.content = content;
  if (description !== undefined) input.description = description;
  if (category !== undefined) input.category = category;
  if (isPublic !== undefined) input.isPublic = isPublic;

  const template = await promptTemplateService.update(id, input);
  return jsonResponse({ template });
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
  await promptTemplateService.delete(id);

  return jsonResponse({ success: true });
}
