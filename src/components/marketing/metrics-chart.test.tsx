import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

import { MetricsChart } from './metrics-chart';

const sampleData = [
  { date: '2026-01-01', impressions: 1000, clicks: 50, conversions: 5 },
  { date: '2026-01-02', impressions: 1200, clicks: 60, conversions: 8 },
  { date: '2026-01-03', impressions: 900, clicks: 45, conversions: 3 },
];

describe('MetricsChart', () => {
  it('should render chart container with correct data-testid', () => {
    render(<MetricsChart data={sampleData} />);
    expect(screen.getByTestId('metrics-chart')).toBeDefined();
  });

  it('should show empty state when no data', () => {
    render(<MetricsChart data={[]} />);
    const container = screen.getByTestId('metrics-chart');
    expect(container).toBeDefined();
    expect(screen.getByText('사용 가능한 메트릭 데이터가 없습니다')).toBeDefined();
  });

  it('should render chart components when data is present', () => {
    render(<MetricsChart data={sampleData} />);
    expect(screen.getByTestId('responsive-container')).toBeDefined();
    expect(screen.getByTestId('line-chart')).toBeDefined();
    expect(screen.getAllByTestId('line')).toHaveLength(3);
  });

  it('should render chart axes and grid', () => {
    render(<MetricsChart data={sampleData} />);
    expect(screen.getByTestId('x-axis')).toBeDefined();
    expect(screen.getByTestId('y-axis')).toBeDefined();
    expect(screen.getByTestId('cartesian-grid')).toBeDefined();
    expect(screen.getByTestId('legend')).toBeDefined();
  });
});
