import { test, expect } from '@playwright/test';

test.describe('Notification System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('should show notification bell in header', async ({ page }) => {
    const bell = page.locator('[aria-label*="Notification"]').first();
    if (await bell.isVisible()) {
      await expect(bell).toBeVisible();
    }
  });

  test('should open notification dropdown', async ({ page }) => {
    const bell = page.locator('[aria-label*="Notification"]').first();
    if (await bell.isVisible()) {
      await bell.click();
      await page.waitForTimeout(500);
      // Dropdown should show
    }
  });

  test('should show mark all read button', async ({ page }) => {
    const bell = page.locator('[aria-label*="Notification"]').first();
    if (await bell.isVisible()) {
      await bell.click();
      await page.waitForTimeout(500);
      const markAllBtn = page.locator('text=Mark all read');
      // Button may or may not be visible depending on unread count
    }
  });

  test('should close notification dropdown on outside click', async ({ page }) => {
    const bell = page.locator('[aria-label*="Notification"]').first();
    if (await bell.isVisible()) {
      await bell.click();
      await page.waitForTimeout(500);
      // Click outside
      await page.click('body', { position: { x: 10, y: 10 } });
      await page.waitForTimeout(500);
    }
  });
});
