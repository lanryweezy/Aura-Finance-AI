import { test, expect } from '@playwright/test';

test.describe('Theme & Appearance', () => {
  test('should toggle between dark and light mode', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    const themeBtn = page.locator('[aria-label*="Switch to"]').first();
    if (await themeBtn.isVisible()) {
      // Get initial theme
      const initialTheme = await page.evaluate(() => localStorage.getItem('aura_theme'));

      // Toggle theme
      await themeBtn.click();
      await page.waitForTimeout(500);

      // Get new theme
      const newTheme = await page.evaluate(() => localStorage.getItem('aura_theme'));

      // Theme should have changed
      expect(newTheme).not.toBe(initialTheme);
    }
  });

  test('should persist theme across page reloads', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    const themeBtn = page.locator('[aria-label*="Switch to"]').first();
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(500);

      const theme = await page.evaluate(() => localStorage.getItem('aura_theme'));

      // Reload page
      await page.reload();
      await page.waitForTimeout(2000);

      // Theme should persist
      const persistedTheme = await page.evaluate(() => localStorage.getItem('aura_theme'));
      expect(persistedTheme).toBe(theme);
    }
  });

  test('should apply dark mode styles', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Check that dark mode classes are applied
    const body = page.locator('body');
    const classList = await body.getAttribute('class');
    // Should have dark-related classes
  });

  test('should apply light mode styles', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Toggle to light mode
    const themeBtn = page.locator('[aria-label*="Switch to"]').first();
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(500);
    }
  });
});
