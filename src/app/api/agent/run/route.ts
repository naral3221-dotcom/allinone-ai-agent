import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { agentRunService } from '@/lib/db/agent-run.service.singleton';
import { createOrchestratorGraph } from '@/agents/orchestrator/graph';

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

  const body = await request.json();
  const { query, conversationId } = body;

  if (!query || typeof query !== 'string' || query.trim() === '') {
    return jsonResponse({ error: 'query is required' }, 400);
  }

  // Create run record
  const run = await agentRunService.createRun({
    userId: user.id,
    agentType: 'orchestrator',
    input: query,
    conversationId,
  });

  try {
    // Invoke orchestrator graph
    const graph = createOrchestratorGraph();
    const startTime = Date.now();

    const result = await graph.invoke({
      query,
      messages: [{ role: 'user', content: query }],
    });

    const duration = Date.now() - startTime;

    // Complete run with result
    await agentRunService.completeRun(run.id, {
      output: result.output,
      steps: result.steps,
      toolCalls: result.toolCalls,
      model: 'claude-sonnet',
      duration,
    });

    return jsonResponse({
      runId: run.id,
      agentType: result.selectedAgent,
      output: result.output,
      steps: result.steps,
      toolCalls: result.toolCalls,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    await agentRunService.failRun(run.id, errorMessage);

    return jsonResponse({ error: errorMessage }, 500);
  }
}

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const url = new URL(request.url);
  const limitParam = url.searchParams.get('limit');
  const agentType = url.searchParams.get('agentType');

  const options: Record<string, unknown> = {};
  if (limitParam) options.limit = parseInt(limitParam, 10);
  if (agentType) options.agentType = agentType;

  const runs = await agentRunService.listRuns(user.id, options);

  return jsonResponse({ runs });
}
