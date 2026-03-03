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

    expect(screen.getByText('채팅')).toBeDefined();
    expect(screen.getByText('리서치')).toBeDefined();
    expect(screen.getByText('문서')).toBeDefined();
    expect(screen.getByText('지식 베이스')).toBeDefined();
    expect(screen.getByText('워크플로우')).toBeDefined();
    expect(screen.getByText('마케팅')).toBeDefined();
    expect(screen.getByText('설정')).toBeDefined();
  });

  it('should render the workspace title', () => {
    render(<Sidebar />);
    expect(screen.getByText('AI 워크스페이스')).toBeDefined();
  });

  it('should show history section on chat route', () => {
    render(<Sidebar />);
    expect(screen.getByText('대화 기록')).toBeDefined();
    expect(screen.getByText('+ 새 대화')).toBeDefined();
  });
});
