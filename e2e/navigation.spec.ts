import { test, expect } from '@playwright/test';

test.describe('Navigation Routes', () => {
  test('all workspace routes return a response', async ({ request }) => {
    // These will return redirects (302 to sign-in) for unauthenticated users
    // but they should NOT return 404
    const routes = ['/chat', '/research', '/documents', '/knowledge', '/settings', '/workflows', '/marketing'];

    for (const route of routes) {
      const response = await request.get(route, { maxRedirects: 0 });
      // Should be either 200 (if somehow auth passes) or 307/302 redirect (to sign-in)
      expect([200, 302, 307, 308]).toContain(response.status());
    }
  });

  test('API health check - conversations endpoint requires auth', async ({ request }) => {
    const response = await request.get('/api/conversations');
    // Should return 401 since we're not authenticated
    expect(response.status()).toBe(401);
  });

  test('API health check - settings endpoint requires auth', async ({ request }) => {
    const response = await request.get('/api/settings');
    expect(response.status()).toBe(401);
  });

  test('not-found page for invalid routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    // Should show 404 page or redirect
    const content = await page.textContent('body');
    const is404 = content?.includes('404') || content?.includes('Not Found');
    const isRedirect = page.url().includes('sign-in');
    expect(is404 || isRedirect).toBeTruthy();
  });
});
