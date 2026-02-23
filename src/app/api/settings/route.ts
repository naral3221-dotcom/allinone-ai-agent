import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { settingsService } from '@/lib/db/settings.service.singleton';

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

  const settings = await settingsService.getSettings(user.id);
  return jsonResponse({ settings });
}

export async function PUT(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

  const body = await request.json().catch(() => ({}));
  const { defaultModel, theme, apiKeys, mcpServers, agentPreferences } = body;

  // Build update data, only include provided fields
  const data: Record<string, unknown> = {};
  if (defaultModel !== undefined) data.defaultModel = defaultModel;
  if (theme !== undefined) data.theme = theme;
  if (apiKeys !== undefined) data.apiKeys = apiKeys;
  if (mcpServers !== undefined) data.mcpServers = mcpServers;
  if (agentPreferences !== undefined) data.agentPreferences = agentPreferences;

  if (Object.keys(data).length === 0) {
    return jsonResponse({ error: 'No fields to update' }, 400);
  }

  const settings = await settingsService.updateSettings(user.id, data);
  return jsonResponse({ settings });
}
