import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResearchHistory } from './research-history';

describe('ResearchHistory', () => {
  const items = [
    { id: 'r1', input: 'What is quantum computing?', status: 'completed', createdAt: '2026-02-23T10:00:00Z' },
    { id: 'r2', input: 'Explain neural networks', status: 'failed', createdAt: '2026-02-22T09:00:00Z' },
    { id: 'r3', input: 'AI in healthcare', status: 'running', createdAt: '2026-02-21T08:00:00Z' },
  ];

  it('should render history items', () => {
    render(<ResearchHistory items={items} onSelect={vi.fn()} />);
    expect(screen.getByTestId('research-history')).toBeDefined();
    expect(screen.getByTestId('history-item-r1')).toBeDefined();
    expect(screen.getByTestId('history-item-r2')).toBeDefined();
    expect(screen.getByTestId('history-item-r3')).toBeDefined();
    expect(screen.getByText('What is quantum computing?')).toBeDefined();
  });

  it('should show empty state when no items', () => {
    render(<ResearchHistory items={[]} onSelect={vi.fn()} />);
    expect(screen.getByTestId('history-empty')).toBeDefined();
    expect(screen.getByText('No research history yet.')).toBeDefined();
  });

  it('should call onSelect when an item is clicked', () => {
    const onSelect = vi.fn();
    render(<ResearchHistory items={items} onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId('history-item-r2'));
    expect(onSelect).toHaveBeenCalledWith('r2');
  });

  it('should highlight the selected item', () => {
    render(<ResearchHistory items={items} onSelect={vi.fn()} selectedId="r1" />);
    const selected = screen.getByTestId('history-item-r1');
    expect(selected.className).toContain('bg-zinc-200');

    const unselected = screen.getByTestId('history-item-r2');
    expect(unselected.className).not.toContain('bg-zinc-200');
  });
});
