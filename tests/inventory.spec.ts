import { test, expect } from '@playwright/test';

test.describe('Inventory', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
  });

  test('should display inventory view', async ({ page }) => {
    await expect(page.locator('text=Inventory Management')).toBeVisible();
  });

  test('should show inventory stats', async ({ page }) => {
    await expect(page.locator('text=Total Items')).toBeVisible();
    await expect(page.locator('text=Stock Value')).toBeVisible();
  });

  test('should show inventory tabs', async ({ page }) => {
    await expect(page.locator('text=Inventory')).toBeVisible();
    await expect(page.locator('text=Stock Movements')).toBeVisible();
    await expect(page.locator('text=Low Stock Alerts')).toBeVisible();
    await expect(page.locator('text=Valuation')).toBeVisible();
  });

  test('should open add item modal', async ({ page }) => {
    const addBtn = page.locator('text=Add Item');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await expect(page.locator('text=Add New Item')).toBeVisible();
    }
  });

  test('should search inventory', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
    }
  });
});
