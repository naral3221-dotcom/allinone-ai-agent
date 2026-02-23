import { DashboardService } from './dashboard';
import { poemoraClient } from './client.singleton';

const globalForDashboard = globalThis as unknown as {
  dashboardService: DashboardService | undefined;
};

export const dashboardService =
  globalForDashboard.dashboardService ?? new DashboardService(poemoraClient);

if (process.env.NODE_ENV !== 'production') {
  globalForDashboard.dashboardService = dashboardService;
}
