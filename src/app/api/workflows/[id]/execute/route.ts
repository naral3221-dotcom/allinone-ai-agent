import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { workflowService } from '@/lib/db/workflow.service.singleton';
import { workflowEngine } from '@/lib/workflow';

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const { id } = await params;
  const workflow = await workflowService.get(id);

  if (!workflow) {
    return jsonResponse({ error: 'Not found' }, 404);
  }

  const result = await workflowEngine.execute({
    steps: workflow.steps.map((s) => ({
      id: s.id,
      order: s.order,
      agentType: s.agentType,
      prompt: s.prompt,
      config: (s.config as Record<string, unknown>) ?? undefined,
    })),
  });
  return jsonResponse({ result });
}
