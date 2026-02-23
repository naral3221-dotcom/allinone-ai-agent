import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CampaignTable } from './campaign-table';

const sampleCampaigns = [
  { id: '1', name: 'Summer Sale', status: 'active', platform: 'Google Ads', budget: 10000, spent: 6500 },
  { id: '2', name: 'Brand Awareness', status: 'paused', platform: 'Meta', budget: 5000, spent: 2000 },
  { id: '3', name: 'Q4 Push', status: 'completed', platform: 'LinkedIn', budget: 8000, spent: 8000 },
];

describe('CampaignTable', () => {
  it('should render table headers', () => {
    render(<CampaignTable campaigns={sampleCampaigns} />);
    expect(screen.getByTestId('campaign-table')).toBeDefined();
    expect(screen.getByText('Name')).toBeDefined();
    expect(screen.getByText('Status')).toBeDefined();
    expect(screen.getByText('Platform')).toBeDefined();
    expect(screen.getByText('Budget')).toBeDefined();
    expect(screen.getByText('Spent')).toBeDefined();
    expect(screen.getByText('ROI')).toBeDefined();
  });

  it('should render campaign rows', () => {
    render(<CampaignTable campaigns={sampleCampaigns} />);
    expect(screen.getByTestId('campaign-row-1')).toBeDefined();
    expect(screen.getByTestId('campaign-row-2')).toBeDefined();
    expect(screen.getByTestId('campaign-row-3')).toBeDefined();
    expect(screen.getByText('Summer Sale')).toBeDefined();
    expect(screen.getByText('Brand Awareness')).toBeDefined();
    expect(screen.getByText('Q4 Push')).toBeDefined();
  });

  it('should show status badges with correct styling', () => {
    render(<CampaignTable campaigns={sampleCampaigns} />);
    const activeBadge = screen.getByTestId('status-badge-1');
    expect(activeBadge.textContent).toBe('active');
    expect(activeBadge.className).toContain('green');

    const pausedBadge = screen.getByTestId('status-badge-2');
    expect(pausedBadge.textContent).toBe('paused');
    expect(pausedBadge.className).toContain('yellow');

    const completedBadge = screen.getByTestId('status-badge-3');
    expect(completedBadge.textContent).toBe('completed');
    expect(completedBadge.className).toContain('zinc');
  });

  it('should show empty state when no campaigns', () => {
    render(<CampaignTable campaigns={[]} />);
    expect(screen.getByTestId('campaign-table')).toBeDefined();
    expect(screen.getByText('No campaigns found')).toBeDefined();
  });
});
