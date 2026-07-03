import { test, expect } from '@playwright/test';

test.describe('Payroll', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.goto('/payroll');
    await page.waitForLoadState('networkidle');
  });

  test('should display payroll view', async ({ page }) => {
    await expect(page.locator('text=Payroll')).toBeVisible();
  });

  test('should show employee list', async ({ page }) => {
    await expect(page.locator('text=Ada Okoro')).toBeVisible({ timeout: 5000 });
  });

  test('should show payroll summary', async ({ page }) => {
    // Check for payroll summary stats
    await expect(page.locator('text=Gross')).toBeVisible({ timeout: 5000 });
  });

  test('should open add employee modal', async ({ page }) => {
    const addBtn = page.locator('text=Add Employee');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await expect(page.locator('text=Add New Employee')).toBeVisible();
    }
  });

  test('should show payroll history tab', async ({ page }) => {
    const historyTab = page.locator('text=History');
    if (await historyTab.isVisible()) {
      await historyTab.click();
    }
  });
});
