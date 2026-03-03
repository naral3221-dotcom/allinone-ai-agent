'use client';

interface SummaryCardsProps {
  data: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalBudget: number;
    totalSpent: number;
    avgCtr: number;
    avgRoas: number;
  };
}

function formatValue(value: number, format: string): string {
  switch (format) {
    case 'currency':
      return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    case 'percent':
      return `${value.toFixed(2)}%`;
    case 'ratio':
      return `${value.toFixed(1)}x`;
    case 'number':
    default:
      return String(value);
  }
}

export function SummaryCards({ data }: SummaryCardsProps) {
  const cards = [
    { label: '총 캠페인', value: data.totalCampaigns, format: 'number' },
    { label: '활성', value: data.activeCampaigns, format: 'number' },
    { label: '예산', value: data.totalBudget, format: 'currency' },
    { label: '지출', value: data.totalSpent, format: 'currency' },
    { label: '평균 CTR', value: data.avgCtr * 100, format: 'percent' },
    { label: '평균 ROAS', value: data.avgRoas, format: 'ratio' },
  ];

  return (
    <div data-testid="summary-cards" className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <div
          key={card.label}
          data-testid={`card-${card.label.toLowerCase().replace(/\s/g, '-')}`}
          className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        >
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{card.label}</p>
          <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {formatValue(card.value, card.format)}
          </p>
        </div>
      ))}
    </div>
  );
}
