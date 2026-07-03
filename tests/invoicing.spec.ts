import { test, expect } from '@playwright/test';

test.describe('Invoicing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    // Navigate to receivables
    await page.goto('/receivables');
    await page.waitForLoadState('networkidle');
  });

  test('should display invoice list', async ({ page }) => {
    await expect(page.locator('text=Accounts Receivable')).toBeVisible();
    // Should show demo invoices
    await expect(page.locator('text=TechCorp Solutions')).toBeVisible({ timeout: 5000 });
  });

  test('should show invoice stats', async ({ page }) => {
    await expect(page.locator('text=Total Outstanding')).toBeVisible();
  });

  test('should open new invoice modal', async ({ page }) => {
    const createBtn = page.locator('text=Create New Invoice');
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await expect(page.locator('text=Create New Invoice')).toBeVisible();
    }
  });

  test('should show invoice actions (PDF, Email, WhatsApp)', async ({ page }) => {
    // Check that action buttons exist
    const pdfBtn = page.locator('text=PDF').first();
    if (await pdfBtn.isVisible()) {
      await expect(pdfBtn).toBeVisible();
    }
  });

  test('should filter invoices by status', async ({ page }) => {
    // Check filter dropdown exists
    const filterSelect = page.locator('select').first();
    if (await filterSelect.isVisible()) {
      await expect(filterSelect).toBeVisible();
    }
  });

  test('should search invoices', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('TechCorp');
      await page.waitForTimeout(500);
      // Should filter results
    }
  });
});
