import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { agentRunService } from '@/lib/db/agent-run.service.singleton';

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
  const run = await agentRunService.getRun(id);

  if (!run) {
    return jsonResponse({ error: 'Run not found' }, 404);
  }

  if (run.userId !== user.id) {
    return jsonResponse({ error: 'Forbidden' }, 403);
  }

  return jsonResponse({ run });
}
