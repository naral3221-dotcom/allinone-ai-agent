import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StepTimeline } from './step-timeline';

describe('StepTimeline', () => {
  const steps = [
    { agentType: 'research', action: 'Web Search', output: 'Found 10 results' },
    { agentType: 'research', action: 'Summarize', output: 'Generated summary' },
    { agentType: 'content', action: 'Format Output' },
  ];

  it('should render step numbers', () => {
    render(<StepTimeline steps={steps} />);
    expect(screen.getByTestId('step-timeline')).toBeDefined();
    expect(screen.getByTestId('step-0')).toBeDefined();
    expect(screen.getByTestId('step-1')).toBeDefined();
    expect(screen.getByTestId('step-2')).toBeDefined();
  });

  it('should render agent type and action for each step', () => {
    render(<StepTimeline steps={steps} />);
    expect(screen.getByText('Web Search')).toBeDefined();
    expect(screen.getByText('Summarize')).toBeDefined();
    expect(screen.getByText('Format Output')).toBeDefined();
  });

  it('should render step output when present', () => {
    render(<StepTimeline steps={steps} />);
    expect(screen.getByText('Found 10 results')).toBeDefined();
    expect(screen.getByText('Generated summary')).toBeDefined();
  });

  it('should return null for empty steps array', () => {
    const { container } = render(<StepTimeline steps={[]} />);
    expect(container.innerHTML).toBe('');
  });
});
