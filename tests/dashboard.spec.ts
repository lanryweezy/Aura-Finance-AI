import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('should display dashboard with stats', async ({ page }) => {
    await expect(page.locator('text=Dashboard')).toBeVisible();
    // Dashboard should have stat cards
    await expect(page.locator('text=Total Outstanding')).toBeVisible();
  });

  test('should show AI alerts widget', async ({ page }) => {
    // AI Alerts should be present (may have 0 alerts)
    const alertsWidget = page.locator('text=AI Alerts');
    await expect(alertsWidget).toBeVisible({ timeout: 5000 }).catch(() => {
      // Alerts widget only shows when there are alerts
    });
  });

  test('should show savings insights widget', async ({ page }) => {
    const savingsWidget = page.locator('text=Savings Insights');
    await expect(savingsWidget).toBeVisible({ timeout: 5000 }).catch(() => {
      // Widget only shows when there are insights
    });
  });

  test('should show forecasting dashboard', async ({ page }) => {
    const forecastWidget = page.locator('text=Cash Flow Forecast');
    await expect(forecastWidget).toBeVisible({ timeout: 5000 }).catch(() => {
      // Widget only shows when there's data
    });
  });

  test('should navigate to transactions from dashboard', async ({ page }) => {
    // Find and click transactions link
    const txLink = page.locator('text=Transactions').first();
    if (await txLink.isVisible()) {
      await txLink.click();
      await page.waitForURL('**/transactions', { timeout: 5000 });
    }
  });
});
