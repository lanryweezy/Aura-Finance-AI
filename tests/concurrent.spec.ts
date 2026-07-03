import { test, expect } from '@playwright/test';

test.describe('Concurrent Sessions', () => {
  test('should handle multiple browser tabs', async ({ browser }) => {
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    // Open demo in first tab
    await page1.goto('/');
    await page1.click('text=Try Demo');
    await page1.click('text=Launch Demo');
    await page1.waitForURL('**/dashboard', { timeout: 10000 });

    // Open same demo in second tab
    await page2.goto('/');
    await page2.click('text=Try Demo');
    await page2.click('text=Launch Demo');
    await page2.waitForURL('**/dashboard', { timeout: 10000 });

    // Both tabs should work independently
    await expect(page1.locator('text=Dashboard')).toBeVisible();
    await expect(page2.locator('text=Dashboard')).toBeVisible();

    // Modify data in tab 1
    await page1.goto('/receivables');
    await page1.waitForLoadState('networkidle');

    // Tab 2 should still work
    await page2.goto('/payables');
    await page2.waitForLoadState('networkidle');

    await context.close();
  });

  test('should handle session timeout', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Simulate session expiry by clearing auth data
    await page.evaluate(() => {
      localStorage.removeItem('aura_user');
      localStorage.removeItem('aura_org');
    });

    // Navigate - should redirect to landing
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
  });
});
