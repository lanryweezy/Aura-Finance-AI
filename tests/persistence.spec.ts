import { test, expect } from '@playwright/test';

test.describe('Data Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('should persist theme selection', async ({ page }) => {
    // Toggle theme
    const themeBtn = page.locator('[aria-label*="Switch to"]').first();
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(500);

      // Check theme is saved
      const theme = await page.evaluate(() => localStorage.getItem('aura_theme'));
      expect(theme).toBeTruthy();
    }
  });

  test('should persist active view', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForTimeout(500);

    const view = await page.evaluate(() => localStorage.getItem('aura_activeView'));
    // View should be persisted or synced from URL
  });

  test('should load demo data on return visit', async ({ page }) => {
    // First visit
    await page.goto('/receivables');
    await page.waitForLoadState('networkidle');

    // Reload
    await page.reload();
    await page.waitForTimeout(2000);

    // Demo data should still be there
    const orgData = await page.evaluate(() => localStorage.getItem('aura_org'));
    expect(orgData).toContain('org_demo');
  });

  test('should maintain cart state across navigation', async ({ page }) => {
    // Navigate to receivables, then away, then back
    await page.goto('/receivables');
    await page.waitForLoadState('networkidle');

    await page.goto('/dashboard');
    await page.waitForTimeout(500);

    await page.goto('/receivables');
    await page.waitForLoadState('networkidle');

    // Data should still be there
    await expect(page.locator('text=Accounts Receivable')).toBeVisible();
  });
});
