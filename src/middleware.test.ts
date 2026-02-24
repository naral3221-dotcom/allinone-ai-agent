import { describe, it, expect } from 'vitest';

const PUBLIC_ROUTES = ['/', '/sign-in', '/sign-up', '/api/auth/callback', '/api/webhooks/test'];
const PROTECTED_ROUTES = ['/chat', '/research', '/documents', '/settings', '/knowledge', '/workflows', '/marketing'];

function isPublicRoute(pathname: string): boolean {
  return pathname === '/' ||
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/webhooks');
}

describe('Middleware route matching', () => {
  it('should mark root as public', () => {
    expect(isPublicRoute('/')).toBe(true);
  });

  it('should mark sign-in as public', () => {
    expect(isPublicRoute('/sign-in')).toBe(true);
    expect(isPublicRoute('/sign-in/callback')).toBe(true);
  });

  it('should mark sign-up as public', () => {
    expect(isPublicRoute('/sign-up')).toBe(true);
  });

  it('should mark auth API as public', () => {
    expect(isPublicRoute('/api/auth/callback/github')).toBe(true);
  });

  it('should mark webhooks as public', () => {
    expect(isPublicRoute('/api/webhooks/clerk')).toBe(true);
  });

  it('should mark workspace routes as protected', () => {
    for (const route of PROTECTED_ROUTES) {
      expect(isPublicRoute(route)).toBe(false);
    }
  });
});
