import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { promptTemplateService } from '@/lib/db/prompt-template.service.singleton';

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
  const { name, content, description, category, isPublic } = body;

  if (!name || typeof name !== 'string' || !content || typeof content !== 'string') {
    return jsonResponse({ error: 'name and content are required' }, 400);
  }

  const input: {
    userId: string;
    name: string;
    content: string;
    description?: string;
    category?: string;
    isPublic?: boolean;
  } = { userId: user.id, name, content };

  if (description !== undefined) input.description = description;
  if (category !== undefined) input.category = category;
  if (isPublic !== undefined) input.isPublic = isPublic;

  const template = await promptTemplateService.create(input);
  return jsonResponse({ template }, 201);
}

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const options: { category?: string } = {};
  if (category) {
    options.category = category;
  }

  const templates = await promptTemplateService.list(user.id, options);
  return jsonResponse({ templates });
}
