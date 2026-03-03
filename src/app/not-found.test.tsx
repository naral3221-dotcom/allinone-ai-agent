import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from './not-found';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe('NotFound', () => {
  it('renders 404 heading', () => {
    render(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders "페이지를 찾을 수 없습니다" text', () => {
    render(<NotFound />);
    expect(screen.getByText('페이지를 찾을 수 없습니다')).toBeInTheDocument();
  });

  it('renders link to workspace', () => {
    render(<NotFound />);
    const link = screen.getByTestId('go-home').closest('a');
    expect(link).toHaveAttribute('href', '/chat');
  });
});
