import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidebar } from './sidebar';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/chat'),
}));

global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve([]),
});

describe('Sidebar', () => {
  it('should render all navigation items', () => {
    render(<Sidebar />);

    expect(screen.getByText('Chat')).toBeDefined();
    expect(screen.getByText('Research')).toBeDefined();
    expect(screen.getByText('Documents')).toBeDefined();
    expect(screen.getByText('Knowledge')).toBeDefined();
    expect(screen.getByText('Workflows')).toBeDefined();
    expect(screen.getByText('Marketing')).toBeDefined();
    expect(screen.getByText('Settings')).toBeDefined();
  });

  it('should render the workspace title', () => {
    render(<Sidebar />);
    expect(screen.getByText('AI Workspace')).toBeDefined();
  });

  it('should show history section on chat route', () => {
    render(<Sidebar />);
    expect(screen.getByText('History')).toBeDefined();
    expect(screen.getByText('+ New')).toBeDefined();
  });
});
