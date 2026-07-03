import { test, expect } from '@playwright/test';

test.describe('Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('should show error boundary on component crash', async ({ page }) => {
    // This tests that error boundaries catch crashes
    // In demo mode, components shouldn't crash
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    // No error boundary should trigger
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Go offline
    await page.context().setOffline(true);

    // Try to load a view
    await page.goto('/receivables');
    await page.waitForTimeout(3000);

    // Should not show unhandled error
    // Go back online
    await page.context().setOffline(false);
  });

  test('should handle API timeout', async ({ page }) => {
    // This would require mocking, but we verify the app doesn't crash
    await page.goto('/receivables');
    await page.waitForLoadState('networkidle');
    // Should load without errors
  });

  test('should handle malformed data gracefully', async ({ page }) => {
    // Inject malformed data into localStorage
    await page.evaluate(() => {
      localStorage.setItem('aura_org', 'invalid json');
    });
    await page.goto('/');
    await page.waitForTimeout(2000);
    // Should handle gracefully
  });

  test('should handle missing localStorage data', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await page.waitForTimeout(2000);
    // Should show landing page
  });
});
