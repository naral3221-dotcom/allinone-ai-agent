import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from './spinner';

describe('Spinner', () => {
  it('renders spinner with default size (md)', () => {
    render(<Spinner />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner.className).toContain('h-8');
    expect(spinner.className).toContain('w-8');
  });

  it('renders small spinner', () => {
    render(<Spinner size="sm" />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner.className).toContain('h-4');
    expect(spinner.className).toContain('w-4');
  });

  it('renders large spinner', () => {
    render(<Spinner size="lg" />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner.className).toContain('h-12');
    expect(spinner.className).toContain('w-12');
  });

  it('has role="status" and aria-label', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('applies custom className', () => {
    render(<Spinner className="custom-class" />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner.className).toContain('custom-class');
  });
});
