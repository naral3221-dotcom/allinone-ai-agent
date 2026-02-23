import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AgentStepCard } from './agent-step-card';

describe('AgentStepCard', () => {
  const defaultStep = {
    id: 'step-1',
    agentType: 'research' as const,
    action: 'search',
    input: 'Find recent AI papers',
    output: 'Found 5 relevant papers on transformer architectures.',
    timestamp: 1708700000000,
  };

  it('should render the agent type', () => {
    render(<AgentStepCard step={defaultStep} />);
    expect(screen.getByText('research')).toBeDefined();
  });

  it('should render the action name', () => {
    render(<AgentStepCard step={defaultStep} />);
    expect(screen.getByText('search')).toBeDefined();
  });

  it('should render the output text', () => {
    render(<AgentStepCard step={defaultStep} />);
    expect(
      screen.getByText('Found 5 relevant papers on transformer architectures.')
    ).toBeDefined();
  });

  it('should apply active styling when isActive is true', () => {
    render(<AgentStepCard step={defaultStep} isActive />);
    const card = screen.getByTestId('agent-step-card');
    expect(card.getAttribute('data-active')).toBe('true');
  });

  it('should not apply active styling when isActive is false', () => {
    render(<AgentStepCard step={defaultStep} isActive={false} />);
    const card = screen.getByTestId('agent-step-card');
    expect(card.getAttribute('data-active')).not.toBe('true');
  });

  it('should format the timestamp as a readable time', () => {
    // Timestamp 1708700000000 = 2024-02-23T14:13:20.000Z
    render(<AgentStepCard step={defaultStep} />);
    const card = screen.getByTestId('agent-step-card');
    // The formatted timestamp text should be present somewhere in the card
    // We look for a time-like string (HH:MM:SS or similar)
    expect(card.textContent).toMatch(/\d{1,2}:\d{2}/);
  });

  it('should render different agent types correctly', () => {
    const codeStep = {
      ...defaultStep,
      id: 'step-2',
      agentType: 'code' as const,
      action: 'generate',
      output: 'Generated a React component.',
    };
    render(<AgentStepCard step={codeStep} />);
    expect(screen.getByText('code')).toBeDefined();
    expect(screen.getByText('generate')).toBeDefined();
  });

  it('should render orchestrator agent type', () => {
    const orchestratorStep = {
      ...defaultStep,
      id: 'step-3',
      agentType: 'orchestrator' as const,
      action: 'route',
      output: 'Routing to research agent.',
    };
    render(<AgentStepCard step={orchestratorStep} />);
    expect(screen.getByText('orchestrator')).toBeDefined();
    expect(screen.getByText('route')).toBeDefined();
  });
});
