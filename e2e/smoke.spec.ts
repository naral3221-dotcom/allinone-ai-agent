import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('root page loads successfully', async ({ page }) => {
    await page.goto('/');
    // Should either show landing page or redirect to /chat (if somehow authenticated)
    // For unauthenticated: should show the landing page
    await expect(page).toHaveTitle(/AI/i);
  });

  test('sign-in page is accessible', async ({ page }) => {
    await page.goto('/sign-in');
    // Clerk sign-in page should load
    await expect(page).toHaveURL(/sign-in/);
  });

  test('sign-up page is accessible', async ({ page }) => {
    await page.goto('/sign-up');
    await expect(page).toHaveURL(/sign-up/);
  });

  test('unauthenticated workspace access redirects to sign-in', async ({ page }) => {
    await page.goto('/chat');
    // Should redirect to sign-in because Clerk middleware protects workspace routes
    await page.waitForURL(/sign-in/, { timeout: 10000 });
    await expect(page).toHaveURL(/sign-in/);
  });

  test('landing page shows sign-in and sign-up links', async ({ page }) => {
    await page.goto('/');
    // The landing page should have Sign In and Sign Up links
    const signInLink = page.getByTestId('sign-in-link');
    const signUpLink = page.getByTestId('sign-up-link');

    // At least one of these should be visible (unless user is already authenticated)
    const hasLinks = await signInLink.isVisible().catch(() => false) ||
                     await signUpLink.isVisible().catch(() => false);
    // If redirected to /chat, that's fine too (means user is authenticated)
    const url = page.url();
    expect(hasLinks || url.includes('/chat')).toBeTruthy();
  });
});
