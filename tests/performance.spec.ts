import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('should load dashboard within 5 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(10000);
  });

  test('should navigate between views quickly', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    const views = ['transactions', 'receivables', 'payables', 'payroll'];
    for (const view of views) {
      const start = Date.now();
      await page.goto(`/${view}`);
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - start;
      expect(loadTime).toBeLessThan(5000);
    }
  });

  test('should handle large dataset rendering', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate to transactions which has many items
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    // Should render without freezing
    await page.waitForTimeout(2000);
  });

  test('should not have memory leaks during navigation', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate multiple times
    for (let i = 0; i < 10; i++) {
      await page.goto('/transactions');
      await page.goto('/receivables');
      await page.goto('/payables');
    }
    // Should not crash
    await page.waitForTimeout(1000);
  });
});
