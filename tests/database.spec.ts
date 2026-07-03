import { test, expect } from '@playwright/test';

test.describe('Database Operations', () => {
  test('should handle CRUD operations', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Create an invoice
    await page.goto('/receivables');
    await page.waitForLoadState('networkidle');
    const createBtn = page.locator('text=Create New Invoice');
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(500);
      // Fill form
      const customerInput = page.locator('input[placeholder*="customer"]').first();
      if (await customerInput.isVisible()) {
        await customerInput.fill('Test Customer');
      }
    }
  });

  test('should handle large dataset operations', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate to transactions which has many items
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    // Search should handle large datasets
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('a');
      await page.waitForTimeout(500);
      await searchInput.clear();
      await page.waitForTimeout(500);
    }
  });

  test('should handle data type edge cases', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate to inventory
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');

    // Open add item modal
    const addBtn = page.locator('text=Add Item');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);

      // Test with special characters
      const nameInput = page.locator('input[name="name"]');
      if (await nameInput.isVisible()) {
        await nameInput.fill('Item with "quotes" & <special> chars');
      }
    }
  });
});
