'use client';

interface Campaign {
  id: string;
  name: string;
  status: string;
  platform: string;
  budget: number;
  spent: number;
}

interface CampaignTableProps {
  campaigns: Campaign[];
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'paused':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'completed':
    default:
      return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
  }
}

function computeRoi(budget: number, spent: number): string {
  if (spent === 0) return 'N/A';
  const roi = ((budget - spent) / spent) * 100;
  return `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`;
}

export function CampaignTable({ campaigns }: CampaignTableProps) {
  if (campaigns.length === 0) {
    return (
      <div
        data-testid="campaign-table"
        className="flex h-40 items-center justify-center rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
      >
        <p className="text-sm text-zinc-500 dark:text-zinc-400">캠페인이 없습니다</p>
      </div>
    );
  }

  return (
    <div
      data-testid="campaign-table"
      className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-300">이름</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-300">상태</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-300">플랫폼</th>
            <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-300">예산</th>
            <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-300">지출</th>
            <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-300">ROI</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr
              key={campaign.id}
              data-testid={`campaign-row-${campaign.id}`}
              className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800"
            >
              <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                {campaign.name}
              </td>
              <td className="px-4 py-3">
                <span
                  data-testid={`status-badge-${campaign.id}`}
                  className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(campaign.status)}`}
                >
                  {campaign.status}
                </span>
              </td>
              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{campaign.platform}</td>
              <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">
                ${campaign.budget.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">
                ${campaign.spent.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">
                {computeRoi(campaign.budget, campaign.spent)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
