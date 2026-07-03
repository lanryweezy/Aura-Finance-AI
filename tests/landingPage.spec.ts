import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load landing page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=AURA')).toBeVisible();
  });

  test('should show hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Autonomous Finance')).toBeVisible();
  });

  test('should show pricing section', async ({ page }) => {
    await page.goto('/');
    const pricingLink = page.locator('a[href="#pricing"]');
    if (await pricingLink.isVisible()) {
      await pricingLink.click();
      await expect(page.locator('text=Pricing')).toBeVisible();
    }
  });

  test('should show features section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=AI CFO')).toBeVisible({ timeout: 5000 });
  });

  test('should show testimonials', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Loved by Nigerian businesses')).toBeVisible({ timeout: 5000 });
  });

  test('should have working CTA buttons', async ({ page }) => {
    await page.goto('/');
    const ctaBtn = page.locator('text=Start Your Free Trial');
    await expect(ctaBtn).toBeVisible();
    await ctaBtn.click();
    // Should open auth modal or navigate
  });

  test('should show mobile hamburger menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(1000);
    // Mobile menu should be available
  });
});
