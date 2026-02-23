import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { AIAssistService } from '@/lib/ai/assist';

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(
  request: Request,
  { params: _params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const body = await request.json().catch(() => ({}));
  const { text, action, options } = body;

  if (!text || typeof text !== 'string') {
    return jsonResponse({ error: 'text is required' }, 400);
  }

  if (!action || typeof action !== 'string') {
    return jsonResponse({ error: 'action is required' }, 400);
  }

  const assistService = new AIAssistService();
  const { result } = await assistService.assist({
    text,
    action,
    options: options ?? {},
  });

  return jsonResponse({ result });
}
