import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { dashboardService } from '@/lib/integrations/poemora/dashboard.singleton';

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
  const { campaignIds, dateRange } = body;

  if (!campaignIds || !Array.isArray(campaignIds)) {
    return jsonResponse({ error: 'campaignIds is required and must be an array' }, 400);
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const resolvedDateRange = dateRange ?? {
    startDate: thirtyDaysAgo.toISOString().split('T')[0],
    endDate: now.toISOString().split('T')[0],
  };

  const comparison = await dashboardService.getMetricsComparison(
    campaignIds,
    resolvedDateRange
  );
  return jsonResponse({ comparison });
}
