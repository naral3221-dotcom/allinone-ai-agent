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

    expect(screen.getByTestId('card-총-캠페인')).toBeDefined();
    expect(screen.getByTestId('card-활성')).toBeDefined();
    expect(screen.getByTestId('card-예산')).toBeDefined();
    expect(screen.getByTestId('card-지출')).toBeDefined();
    expect(screen.getByTestId('card-평균-ctr')).toBeDefined();
    expect(screen.getByTestId('card-평균-roas')).toBeDefined();
  });

  it('should format currency values with dollar sign', () => {
    render(<SummaryCards data={defaultData} />);
    const budgetCard = screen.getByTestId('card-예산');
    expect(budgetCard.textContent).toContain('$50,000');

    const spentCard = screen.getByTestId('card-지출');
    expect(spentCard.textContent).toContain('$32,500');
  });

  it('should format percentage values with percent sign', () => {
    render(<SummaryCards data={defaultData} />);
    const ctrCard = screen.getByTestId('card-평균-ctr');
    expect(ctrCard.textContent).toContain('3.45%');
  });

  it('should format ratio values with x suffix', () => {
    render(<SummaryCards data={defaultData} />);
    const roasCard = screen.getByTestId('card-평균-roas');
    expect(roasCard.textContent).toContain('3.2x');
  });

  it('should render card labels correctly', () => {
    render(<SummaryCards data={defaultData} />);
    expect(screen.getByText('총 캠페인')).toBeDefined();
    expect(screen.getByText('활성')).toBeDefined();
    expect(screen.getByText('예산')).toBeDefined();
    expect(screen.getByText('지출')).toBeDefined();
    expect(screen.getByText('평균 CTR')).toBeDefined();
    expect(screen.getByText('평균 ROAS')).toBeDefined();
  });
});
