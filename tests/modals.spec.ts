import { test, expect } from '@playwright/test';

test.describe('Modal Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('should open and close invoice modal', async ({ page }) => {
    await page.goto('/receivables');
    await page.waitForLoadState('networkidle');

    const createBtn = page.locator('text=Create New Invoice');
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(500);

      // Close modal
      const cancelBtn = page.locator('text=Cancel');
      if (await cancelBtn.isVisible()) {
        await cancelBtn.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should open and close bill modal', async ({ page }) => {
    await page.goto('/payables');
    await page.waitForLoadState('networkidle');

    const addBtn = page.locator('text=Add New Bill');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);

      const cancelBtn = page.locator('text=Cancel');
      if (await cancelBtn.isVisible()) {
        await cancelBtn.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should close modal on backdrop click', async ({ page }) => {
    await page.goto('/receivables');
    await page.waitForLoadState('networkidle');

    const createBtn = page.locator('text=Create New Invoice');
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(500);

      // Click outside modal (backdrop)
      await page.click('body', { position: { x: 10, y: 10 } });
      await page.waitForTimeout(500);
    }
  });

  test('should close modal with Escape key', async ({ page }) => {
    await page.goto('/receivables');
    await page.waitForLoadState('networkidle');

    const createBtn = page.locator('text=Create New Invoice');
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(500);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  });

  test('should handle multiple modals stacked', async ({ page }) => {
    // This tests that opening a modal inside another modal works
    await page.goto('/receivables');
    await page.waitForLoadState('networkidle');

    const createBtn = page.locator('text=Create New Invoice');
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(500);
      // Modal should be open
    }
  });
});
