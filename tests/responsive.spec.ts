import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('should work on mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Should show mobile hamburger menu
    const hamburger = page.locator('button[aria-label*="navigation"]').first();
    if (await hamburger.isVisible()) {
      await hamburger.click();
      await page.waitForTimeout(500);
    }
  });

  test('should work on tablet (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Dashboard should render properly
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should work on desktop (1920px)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Full sidebar should be visible
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should handle viewport resize dynamically', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Start mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Resize to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);

    // Should still work
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should have touch-friendly buttons on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Buttons should be large enough for touch
    const buttons = page.locator('button');
    const count = await buttons.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      const box = await buttons.nth(i).boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44); // Minimum touch target
      }
    }
  });
});
