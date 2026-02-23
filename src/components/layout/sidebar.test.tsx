import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidebar } from './sidebar';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/chat'),
}));

describe('Sidebar', () => {
  it('should render all navigation items', () => {
    render(<Sidebar />);

    expect(screen.getByText('Chat')).toBeDefined();
    expect(screen.getByText('Research')).toBeDefined();
    expect(screen.getByText('Documents')).toBeDefined();
    expect(screen.getByText('Canvas')).toBeDefined();
    expect(screen.getByText('Knowledge')).toBeDefined();
    expect(screen.getByText('Settings')).toBeDefined();
  });

  it('should render the workspace title', () => {
    render(<Sidebar />);
    expect(screen.getByText('AI Workspace')).toBeDefined();
  });

  it('should have correct href for nav items', () => {
    render(<Sidebar />);
    const chatLink = screen.getByText('Chat').closest('a');
    expect(chatLink?.getAttribute('href')).toBe('/chat');
  });
});
