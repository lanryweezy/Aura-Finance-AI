import { test, expect } from '@playwright/test';

test.describe('API Error Handling', () => {
  test('should handle network timeout', async ({ page }) => {
    // Intercept and timeout API calls
    await page.route('**/api/**', route => {
      route.abort('timedout');
    });

    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // App should handle timeout gracefully
    await page.waitForTimeout(3000);
  });

  test('should handle 500 server errors', async ({ page }) => {
    await page.route('**/api/**', route => {
      route.fulfill({ status: 500, body: 'Internal Server Error' });
    });

    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    await page.waitForTimeout(3000);
  });

  test('should handle 404 not found', async ({ page }) => {
    await page.route('**/api/**', route => {
      route.fulfill({ status: 404, body: 'Not Found' });
    });

    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    await page.waitForTimeout(3000);
  });

  test('should handle malformed JSON responses', async ({ page }) => {
    await page.route('**/api/**', route => {
      route.fulfill({ status: 200, body: 'not json' });
    });

    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    await page.waitForTimeout(3000);
  });

  test('should handle rate limiting', async ({ page }) => {
    await page.route('**/api/**', route => {
      route.fulfill({ status: 429, body: 'Rate limit exceeded' });
    });

    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    await page.waitForTimeout(3000);
  });

  test('should handle connection refused', async ({ page }) => {
    await page.route('**/api/**', route => {
      route.abort('connectionrefused');
    });

    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    await page.waitForTimeout(3000);
  });
});
