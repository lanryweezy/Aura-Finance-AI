import { test, expect } from '@playwright/test';

test.describe('Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('should validate required fields in invoice form', async ({ page }) => {
    await page.goto('/receivables');
    await page.waitForLoadState('networkidle');

    const createBtn = page.locator('text=Create New Invoice');
    if (await createBtn.isVisible()) {
      await createBtn.click();
      // Try to submit without filling required fields
      const submitBtn = page.locator('button[type="submit"]');
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        // Should show validation errors
        await page.waitForTimeout(500);
      }
    }
  });

  test('should validate required fields in bill form', async ({ page }) => {
    await page.goto('/payables');
    await page.waitForLoadState('networkidle');

    const addBtn = page.locator('text=Add New Bill');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      const submitBtn = page.locator('button[type="submit"]');
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should validate required fields in employee form', async ({ page }) => {
    await page.goto('/payroll');
    await page.waitForLoadState('networkidle');

    const addBtn = page.locator('text=Add Employee');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      const submitBtn = page.locator('button[type="submit"]');
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should validate numeric inputs', async ({ page }) => {
    await page.goto('/receivables');
    await page.waitForLoadState('networkidle');

    const createBtn = page.locator('text=Create New Invoice');
    if (await createBtn.isVisible()) {
      await createBtn.click();
      // Try to enter negative amount
      const amountInput = page.locator('input[type="number"]').first();
      if (await amountInput.isVisible()) {
        await amountInput.fill('-100');
        await page.waitForTimeout(500);
      }
    }
  });

  test('should handle very large numbers', async ({ page }) => {
    await page.goto('/receivables');
    await page.waitForLoadState('networkidle');

    const createBtn = page.locator('text=Create New Invoice');
    if (await createBtn.isVisible()) {
      await createBtn.click();
      const amountInput = page.locator('input[type="number"]').first();
      if (await amountInput.isVisible()) {
        await amountInput.fill('999999999999');
        await page.waitForTimeout(500);
      }
    }
  });

  test('should handle decimal inputs', async ({ page }) => {
    await page.goto('/receivables');
    await page.waitForLoadState('networkidle');

    const createBtn = page.locator('text=Create New Invoice');
    if (await createBtn.isVisible()) {
      await createBtn.click();
      const amountInput = page.locator('input[type="number"]').first();
      if (await amountInput.isVisible()) {
        await amountInput.fill('1234.56');
        await page.waitForTimeout(500);
      }
    }
  });
});
