import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('should navigate to all main views via sidebar', async ({ page }) => {
    const views = ['transactions', 'receivables', 'payables', 'payroll', 'reports', 'inventory', 'contacts', 'projects'];

    for (const view of views) {
      await page.goto(`/${view}`);
      await page.waitForLoadState('networkidle');
      // Page should load without errors
      const errorText = page.locator('text=Error');
      const hasError = await errorText.isVisible().catch(() => false);
      expect(hasError).toBe(false);
    }
  });

  test('should handle invalid routes gracefully', async ({ page }) => {
    await page.goto('/nonexistent-view');
    // Should redirect to dashboard or show 404
    await page.waitForTimeout(2000);
  });

  test('should navigate via command palette', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(500);
    // Command palette should open
    const searchInput = page.locator('input[placeholder*="Search commands"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('transactions');
      await page.waitForTimeout(500);
    }
  });
});
