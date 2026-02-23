import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { workflowService } from '@/lib/db/workflow.service.singleton';

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
  const { name, description, steps } = body;

  if (!name || typeof name !== 'string') {
    return jsonResponse({ error: 'name is required' }, 400);
  }

  if (!steps || !Array.isArray(steps)) {
    return jsonResponse({ error: 'steps is required and must be an array' }, 400);
  }

  const input: {
    userId: string;
    name: string;
    description?: string;
    steps: Array<{
      order: number;
      agentType: string;
      prompt: string;
      config?: Record<string, unknown>;
    }>;
  } = { userId: user.id, name, steps };

  if (description !== undefined) input.description = description;

  const workflow = await workflowService.create(input);
  return jsonResponse({ workflow }, 201);
}

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const workflows = await workflowService.list(user.id);
  return jsonResponse({ workflows });
}
