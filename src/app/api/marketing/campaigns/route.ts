import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { poemoraClient } from '@/lib/integrations/poemora/client.singleton';

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(_request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const campaigns = await poemoraClient.getCampaigns();
  return jsonResponse({ campaigns });
}
