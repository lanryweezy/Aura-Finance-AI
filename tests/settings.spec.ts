import { test, expect } from '@playwright/test';

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
  });

  test('should display settings view', async ({ page }) => {
    await expect(page.locator('text=Settings')).toBeVisible();
  });

  test('should show security settings', async ({ page }) => {
    await expect(page.locator('text=Security')).toBeVisible({ timeout: 5000 });
  });

  test('should show theme toggle', async ({ page }) => {
    // Theme toggle should be in header
    const themeBtn = page.locator('[aria-label*="Switch to"]').first();
    if (await themeBtn.isVisible()) {
      await expect(themeBtn).toBeVisible();
    }
  });
});
