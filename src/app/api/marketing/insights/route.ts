import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { insightGenerator } from '@/lib/integrations/poemora/insights.singleton';
import type { InsightRequest } from '@/lib/integrations/poemora/insights';

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

  const body: unknown = await request.json();

  if (
    typeof body !== 'object' ||
    body === null ||
    !('dateRange' in body) ||
    typeof (body as Record<string, unknown>)['dateRange'] !== 'object' ||
    (body as Record<string, unknown>)['dateRange'] === null
  ) {
    return jsonResponse({ error: 'dateRange is required' }, 400);
  }

  const raw = body as Record<string, unknown>;
  const dateRangeRaw = raw['dateRange'] as Record<string, unknown>;

  if (
    typeof dateRangeRaw['startDate'] !== 'string' ||
    typeof dateRangeRaw['endDate'] !== 'string'
  ) {
    return jsonResponse({ error: 'dateRange must contain startDate and endDate' }, 400);
  }

  const insightRequest: InsightRequest = {
    dateRange: {
      startDate: dateRangeRaw['startDate'],
      endDate: dateRangeRaw['endDate'],
    },
  };

  if (Array.isArray(raw['campaignIds'])) {
    insightRequest.campaignIds = (raw['campaignIds'] as unknown[]).filter(
      (id): id is string => typeof id === 'string'
    );
  }

  const validFocuses = ['performance', 'budget', 'audience', 'overall'];
  if (typeof raw['focus'] === 'string' && validFocuses.includes(raw['focus'])) {
    insightRequest.focus = raw['focus'] as InsightRequest['focus'];
  }

  const insight = await insightGenerator.generate(insightRequest);
  return jsonResponse({ insight });
}
