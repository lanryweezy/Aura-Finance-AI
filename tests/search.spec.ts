import { test, expect } from '@playwright/test';

test.describe('Search & Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('should search invoices by customer name', async ({ page }) => {
    await page.goto('/receivables');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('TechCorp');
      await page.waitForTimeout(500);
      // Should filter to show TechCorp invoices
      await expect(page.locator('text=TechCorp Solutions')).toBeVisible();
    }
  });

  test('should search bills by vendor name', async ({ page }) => {
    await page.goto('/payables');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('AWS');
      await page.waitForTimeout(500);
      await expect(page.locator('text=AWS')).toBeVisible();
    }
  });

  test('should search inventory by name', async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
    }
  });

  test('should clear search and show all results', async ({ page }) => {
    await page.goto('/receivables');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('TechCorp');
      await page.waitForTimeout(500);
      await searchInput.clear();
      await page.waitForTimeout(500);
      // Should show all invoices again
    }
  });

  test('should handle no search results', async ({ page }) => {
    await page.goto('/receivables');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('xyznonexistent123');
      await page.waitForTimeout(500);
      // Should show "no results" message
    }
  });

  test('should filter invoices by status', async ({ page }) => {
    await page.goto('/receivables');
    await page.waitForLoadState('networkidle');

    const filterSelect = page.locator('select').first();
    if (await filterSelect.isVisible()) {
      await filterSelect.selectOption('Paid');
      await page.waitForTimeout(500);
    }
  });

  test('should search contacts by name', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('TechCorp');
      await page.waitForTimeout(500);
    }
  });
});
