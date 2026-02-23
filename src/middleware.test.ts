import { describe, it, expect, vi } from 'vitest';
import { createRouteMatcher } from '@clerk/nextjs/server';

vi.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: vi.fn((handler) => handler),
  createRouteMatcher: vi.fn((patterns: string[]) => {
    return (request: { nextUrl: { pathname: string } }) => {
      return patterns.some((pattern) => {
        const regexStr = '^' + pattern.replace('(.*)', '.*') + '$';
        return new RegExp(regexStr).test(request.nextUrl.pathname);
      });
    };
  }),
}));

function makeRequest(pathname: string) {
  return { nextUrl: { pathname } } as { nextUrl: { pathname: string } };
}

describe('Middleware route matching', () => {
  const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhooks(.*)',
  ]);

  it('should mark root as public', () => {
    expect(isPublicRoute(makeRequest('/'))).toBe(true);
  });

  it('should mark sign-in as public', () => {
    expect(isPublicRoute(makeRequest('/sign-in'))).toBe(true);
    expect(isPublicRoute(makeRequest('/sign-in/sso-callback'))).toBe(true);
  });

  it('should mark sign-up as public', () => {
    expect(isPublicRoute(makeRequest('/sign-up'))).toBe(true);
  });

  it('should mark webhooks as public', () => {
    expect(isPublicRoute(makeRequest('/api/webhooks/clerk'))).toBe(true);
  });

  it('should mark workspace routes as protected', () => {
    expect(isPublicRoute(makeRequest('/chat'))).toBe(false);
    expect(isPublicRoute(makeRequest('/research'))).toBe(false);
    expect(isPublicRoute(makeRequest('/documents'))).toBe(false);
    expect(isPublicRoute(makeRequest('/settings'))).toBe(false);
  });
});
