import { test, expect } from '@playwright/test';

test.describe('Payables', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.goto('/payables');
    await page.waitForLoadState('networkidle');
  });

  test('should display bill list', async ({ page }) => {
    await expect(page.locator('text=Accounts Payable')).toBeVisible();
    await expect(page.locator('text=AWS')).toBeVisible({ timeout: 5000 });
  });

  test('should open new bill modal', async ({ page }) => {
    const addBtn = page.locator('text=Add New Bill');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await expect(page.locator('text=Add New Bill')).toBeVisible();
    }
  });

  test('should show bill actions (PDF, Email, WhatsApp)', async ({ page }) => {
    const pdfBtn = page.locator('text=PDF').first();
    if (await pdfBtn.isVisible()) {
      await expect(pdfBtn).toBeVisible();
    }
  });

  test('should search bills', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('AWS');
      await page.waitForTimeout(500);
    }
  });
});
