import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExecutionResult } from './execution-result';

const mockResult = {
  status: 'completed',
  results: [
    { step: 1, status: 'completed', output: 'Research done' },
    { step: 2, status: 'failed', error: 'Timeout occurred' },
  ],
};

describe('ExecutionResult', () => {
  it('renders overall status', () => {
    render(<ExecutionResult result={mockResult} />);
    const statusEl = screen.getByTestId('execution-status');
    expect(statusEl.textContent).toBe('completed');
  });

  it('renders step results', () => {
    render(<ExecutionResult result={mockResult} />);
    expect(screen.getByTestId('step-result-1')).toBeDefined();
    expect(screen.getByTestId('step-result-2')).toBeDefined();
    expect(screen.getByText('Research done')).toBeDefined();
    expect(screen.getByText('Timeout occurred')).toBeDefined();
  });

  it('shows completed steps with green styling', () => {
    render(<ExecutionResult result={mockResult} />);
    const step1 = screen.getByTestId('step-result-1');
    expect(step1.className).toContain('green');
  });

  it('shows failed steps with red styling', () => {
    render(<ExecutionResult result={mockResult} />);
    const step2 = screen.getByTestId('step-result-2');
    expect(step2.className).toContain('red');
  });
});
