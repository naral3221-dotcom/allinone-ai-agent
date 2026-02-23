import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResearchResult } from './research-result';

describe('ResearchResult', () => {
  const baseResult = {
    id: 'run-1',
    status: 'completed',
    output: 'This is the research output.',
    error: null,
    duration: 2500,
    createdAt: '2026-02-23T10:00:00Z',
  };

  it('should render completed status badge', () => {
    render(<ResearchResult result={baseResult} />);
    const badge = screen.getByTestId('result-status');
    expect(badge.textContent).toBe('completed');
    expect(badge.className).toContain('bg-green-100');
  });

  it('should render failed status with error message', () => {
    render(
      <ResearchResult
        result={{
          ...baseResult,
          status: 'failed',
          output: null,
          error: 'Something went wrong',
        }}
      />
    );
    const badge = screen.getByTestId('result-status');
    expect(badge.textContent).toBe('failed');
    expect(badge.className).toContain('bg-red-100');

    const errorEl = screen.getByTestId('result-error');
    expect(errorEl.textContent).toBe('Something went wrong');
  });

  it('should render output text', () => {
    render(<ResearchResult result={baseResult} />);
    const output = screen.getByTestId('result-output');
    expect(output.textContent).toContain('This is the research output.');
  });

  it('should render duration formatted as seconds', () => {
    render(<ResearchResult result={baseResult} />);
    const duration = screen.getByTestId('result-duration');
    expect(duration.textContent).toBe('2.5s');
  });

  it('should render duration in ms when under 1000', () => {
    render(<ResearchResult result={{ ...baseResult, duration: 450 }} />);
    const duration = screen.getByTestId('result-duration');
    expect(duration.textContent).toBe('450ms');
  });

  it('should render creation date', () => {
    render(<ResearchResult result={baseResult} />);
    const dateEl = screen.getByTestId('result-date');
    expect(dateEl.textContent).toBeTruthy();
  });
});
