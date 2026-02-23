import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { promptTemplateService } from '@/lib/db/prompt-template.service.singleton';

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
  const template = await promptTemplateService.get(id);

  if (!template) {
    return jsonResponse({ error: 'Not found' }, 404);
  }

  const body = await request.json().catch(() => ({}));
  const variables: Record<string, string> = body.variables ?? {};

  const rendered = promptTemplateService.renderTemplate(template.content, variables);
  return jsonResponse({ rendered });
}
