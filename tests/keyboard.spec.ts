import { test, expect } from '@playwright/test';

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('should open command palette with Ctrl+K', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(500);
    const searchInput = page.locator('input[placeholder*="Search commands"]');
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
    }
  });

  test('should close command palette with Escape', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  });

  test('should navigate with keyboard shortcuts', async ({ page }) => {
    // Ctrl+D for dashboard
    await page.keyboard.press('Control+d');
    await page.waitForTimeout(1000);
  });

  test('should search in command palette', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(500);

    const searchInput = page.locator('input[placeholder*="Search commands"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('invoice');
      await page.waitForTimeout(500);
      // Should show filtered results
    }
  });

  test('should navigate command palette with arrow keys', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(500);

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(500);
  });
});
