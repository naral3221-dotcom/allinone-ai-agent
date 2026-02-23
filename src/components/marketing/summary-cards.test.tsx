import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SummaryCards } from './summary-cards';

const defaultData = {
  totalCampaigns: 12,
  activeCampaigns: 5,
  totalBudget: 50000,
  totalSpent: 32500,
  avgCtr: 0.0345,
  avgRoas: 3.2,
};

describe('SummaryCards', () => {
  it('should render all 6 cards', () => {
    render(<SummaryCards data={defaultData} />);
    const container = screen.getByTestId('summary-cards');
    expect(container).toBeDefined();

    expect(screen.getByTestId('card-total-campaigns')).toBeDefined();
    expect(screen.getByTestId('card-active')).toBeDefined();
    expect(screen.getByTestId('card-budget')).toBeDefined();
    expect(screen.getByTestId('card-spent')).toBeDefined();
    expect(screen.getByTestId('card-avg-ctr')).toBeDefined();
    expect(screen.getByTestId('card-avg-roas')).toBeDefined();
  });

  it('should format currency values with dollar sign', () => {
    render(<SummaryCards data={defaultData} />);
    const budgetCard = screen.getByTestId('card-budget');
    expect(budgetCard.textContent).toContain('$50,000');

    const spentCard = screen.getByTestId('card-spent');
    expect(spentCard.textContent).toContain('$32,500');
  });

  it('should format percentage values with percent sign', () => {
    render(<SummaryCards data={defaultData} />);
    const ctrCard = screen.getByTestId('card-avg-ctr');
    expect(ctrCard.textContent).toContain('3.45%');
  });

  it('should format ratio values with x suffix', () => {
    render(<SummaryCards data={defaultData} />);
    const roasCard = screen.getByTestId('card-avg-roas');
    expect(roasCard.textContent).toContain('3.2x');
  });

  it('should render card labels correctly', () => {
    render(<SummaryCards data={defaultData} />);
    expect(screen.getByText('Total Campaigns')).toBeDefined();
    expect(screen.getByText('Active')).toBeDefined();
    expect(screen.getByText('Budget')).toBeDefined();
    expect(screen.getByText('Spent')).toBeDefined();
    expect(screen.getByText('Avg CTR')).toBeDefined();
    expect(screen.getByText('Avg ROAS')).toBeDefined();
  });
});
