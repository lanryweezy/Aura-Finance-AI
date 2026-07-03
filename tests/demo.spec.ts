import { test, expect } from '@playwright/test';

test.describe('Demo Mode', () => {
  test('should load demo mode from landing page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click "Try Demo" button
    const demoButton = page.locator('text=Try Demo');
    await expect(demoButton).toBeVisible();
    await demoButton.click();

    // Demo modal should appear
    await expect(page.locator('text=Try Aura Finance AI')).toBeVisible();
    await expect(page.locator('text=Launch Demo')).toBeVisible();
  });

  test('should launch demo and navigate to dashboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open demo modal
    await page.click('text=Try Demo');
    await expect(page.locator('text=Launch Demo')).toBeVisible();

    // Launch demo
    await page.click('text=Launch Demo');

    // Should navigate to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should have demo data loaded', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Check demo data is loaded via localStorage
    const orgData = await page.evaluate(() => localStorage.getItem('aura_org'));
    expect(orgData).toContain('org_demo');
  });

  test('should show demo user in header', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Check user name is displayed
    await expect(page.locator('text=Demo User')).toBeVisible();
  });
});
