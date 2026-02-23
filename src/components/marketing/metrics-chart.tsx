'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface MetricPoint {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
}

interface MetricsChartProps {
  data: MetricPoint[];
}

export function MetricsChart({ data }: MetricsChartProps) {
  if (data.length === 0) {
    return (
      <div
        data-testid="metrics-chart"
        className="flex h-[300px] items-center justify-center rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
      >
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No metrics data available</p>
      </div>
    );
  }

  return (
    <div
      data-testid="metrics-chart"
      className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <h3 className="mb-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
        Performance Over Time
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="impressions"
            stroke="#3b82f6"
            name="Impressions"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="clicks"
            stroke="#22c55e"
            name="Clicks"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="conversions"
            stroke="#f97316"
            name="Conversions"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
