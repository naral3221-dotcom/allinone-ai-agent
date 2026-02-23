import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { dashboardService } from '@/lib/integrations/poemora/dashboard.singleton';
import type { DateRange } from '@/lib/integrations/poemora/types';

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const url = new URL(request.url);
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dateRange: DateRange = {
    startDate: startDate ?? thirtyDaysAgo.toISOString().split('T')[0],
    endDate: endDate ?? now.toISOString().split('T')[0],
  };

  const summary = await dashboardService.getDashboardSummary(dateRange);
  return jsonResponse({ summary });
}
