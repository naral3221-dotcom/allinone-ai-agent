import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InsightPanel } from './insight-panel';

const mockInsight = {
  summary: 'Your campaigns are performing well with a 3.4% CTR average.',
  recommendations: [
    'Increase budget for top-performing campaigns',
    'Pause underperforming ad sets',
    'Test new creatives for the holiday season',
  ],
  generatedAt: '2026-02-20T10:00:00Z',
};

describe('InsightPanel', () => {
  it('should render generate button', () => {
    const onGenerate = vi.fn().mockResolvedValue(null);
    render(<InsightPanel onGenerate={onGenerate} />);
    expect(screen.getByTestId('insight-panel')).toBeDefined();
    expect(screen.getByTestId('generate-insight-button')).toBeDefined();
    expect(screen.getByText('AI 인사이트 생성')).toBeDefined();
  });

  it('should show generating state while loading', async () => {
    let resolvePromise: (value: typeof mockInsight | null) => void;
    const promise = new Promise<typeof mockInsight | null>((resolve) => {
      resolvePromise = resolve;
    });
    const onGenerate = vi.fn().mockReturnValue(promise);

    render(<InsightPanel onGenerate={onGenerate} />);
    const button = screen.getByTestId('generate-insight-button');

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('생성 중...')).toBeDefined();
    });
    expect(button.hasAttribute('disabled')).toBe(true);

    resolvePromise!(mockInsight);
    await waitFor(() => {
      expect(screen.getByText('AI 인사이트 생성')).toBeDefined();
    });
  });

  it('should display insight summary after generation', async () => {
    const onGenerate = vi.fn().mockResolvedValue(mockInsight);
    render(<InsightPanel onGenerate={onGenerate} />);

    fireEvent.click(screen.getByTestId('generate-insight-button'));

    await waitFor(() => {
      expect(screen.getByTestId('insight-result')).toBeDefined();
    });
    expect(
      screen.getByText('Your campaigns are performing well with a 3.4% CTR average.')
    ).toBeDefined();
  });

  it('should display recommendations list', async () => {
    const onGenerate = vi.fn().mockResolvedValue(mockInsight);
    render(<InsightPanel onGenerate={onGenerate} />);

    fireEvent.click(screen.getByTestId('generate-insight-button'));

    await waitFor(() => {
      expect(screen.getByTestId('insight-recommendations')).toBeDefined();
    });

    expect(screen.getByText('Increase budget for top-performing campaigns')).toBeDefined();
    expect(screen.getByText('Pause underperforming ad sets')).toBeDefined();
    expect(screen.getByText('Test new creatives for the holiday season')).toBeDefined();
  });

  it('should disable button while generating', async () => {
    let resolvePromise: (value: typeof mockInsight | null) => void;
    const promise = new Promise<typeof mockInsight | null>((resolve) => {
      resolvePromise = resolve;
    });
    const onGenerate = vi.fn().mockReturnValue(promise);

    render(<InsightPanel onGenerate={onGenerate} />);
    const button = screen.getByTestId('generate-insight-button');

    expect(button.hasAttribute('disabled')).toBe(false);

    fireEvent.click(button);

    await waitFor(() => {
      expect(button.hasAttribute('disabled')).toBe(true);
    });

    resolvePromise!(null);

    await waitFor(() => {
      expect(button.hasAttribute('disabled')).toBe(false);
    });
  });
});
