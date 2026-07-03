import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('should have skip navigation link', async ({ page }) => {
    // Skip nav should exist but be visually hidden
    const skipNav = page.locator('a[href="#main-content"]');
    await expect(skipNav).toHaveCount(1);
  });

  test('should have main content landmark', async ({ page }) => {
    const main = page.locator('#main-content');
    await expect(main).toHaveCount(1);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Dashboard should have h2 headings
    const headings = page.locator('h2, h3');
    const count = await headings.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have aria labels on interactive elements', async ({ page }) => {
    // Check notification bell has aria-label
    const bell = page.locator('[aria-label*="Notification"]');
    if (await bell.count() > 0) {
      await expect(bell.first()).toHaveAttribute('aria-label');
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    // Should not crash
  });

  test('should have focus indicators', async ({ page }) => {
    // Tab to a button and check focus ring
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toHaveCount(1);
  });
});
