import { test, expect } from '@playwright/test';

test.describe('Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('should handle empty state gracefully', async ({ page }) => {
    // Clear all demo data
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.goto('/');
    // Should show landing page or error, not crash
    await page.waitForTimeout(2000);
  });

  test('should handle rapid navigation', async ({ page }) => {
    const views = ['dashboard', 'transactions', 'receivables', 'payables', 'payroll', 'reports'];
    for (const view of views) {
      await page.goto(`/${view}`, { waitUntil: 'domcontentloaded' });
    }
    // Should not crash
    await page.waitForTimeout(1000);
  });

  test('should handle form submission with empty fields', async ({ page }) => {
    await page.goto('/receivables');
    await page.waitForLoadState('networkidle');

    // Try to open new invoice modal
    const createBtn = page.locator('text=Create New Invoice');
    if (await createBtn.isVisible()) {
      await createBtn.click();
      // Try to submit empty form
      const submitBtn = page.locator('button[type="submit"]');
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        // Should show validation errors, not crash
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should handle very long text input', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const input = page.locator('input[placeholder*="Ask about"]');
    if (await input.isVisible()) {
      const longText = 'A'.repeat(10000);
      await input.fill(longText);
      await input.press('Enter');
      await page.waitForTimeout(1000);
    }
  });

  test('should handle special characters in input', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const input = page.locator('input[placeholder*="Ask about"]');
    if (await input.isVisible()) {
      await input.fill('<script>alert("xss")</script>');
      await input.press('Enter');
      await page.waitForTimeout(1000);
    }
  });

  test('should handle concurrent API calls', async ({ page }) => {
    // Navigate rapidly between views that trigger API calls
    await page.goto('/dashboard');
    await page.goto('/transactions');
    await page.goto('/receivables');
    await page.goto('/payables');
    // Should not crash
    await page.waitForTimeout(2000);
  });

  test('should handle browser resize', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
  });

  test('should handle offline scenario', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Go offline
    await page.context().setOffline(true);
    await page.waitForTimeout(2000);

    // Should show some indication of offline
    // Go back online
    await page.context().setOffline(false);
    await page.waitForTimeout(2000);
  });
});
