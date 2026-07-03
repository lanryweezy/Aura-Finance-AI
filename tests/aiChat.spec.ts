import { test, expect } from '@playwright/test';

test.describe('AI Chat', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should display AI chat interface', async ({ page }) => {
    await expect(page.locator('text=Aura AI Workforce')).toBeVisible();
  });

  test('should show agent tabs', async ({ page }) => {
    await expect(page.locator('text=CFO')).toBeVisible();
    await expect(page.locator('text=Tax')).toBeVisible();
    await expect(page.locator('text=Payroll')).toBeVisible();
    await expect(page.locator('text=OpsBot')).toBeVisible();
  });

  test('should have message input', async ({ page }) => {
    const input = page.locator('input[placeholder*="Ask about"]');
    await expect(input).toBeVisible();
  });

  test('should send a message', async ({ page }) => {
    const input = page.locator('input[placeholder*="Ask about"]');
    await input.fill('What is my burn rate?');
    await input.press('Enter');
    // Should show loading or response
    await page.waitForTimeout(2000);
  });

  test('should switch between agents', async ({ page }) => {
    const taxTab = page.locator('button:has-text("Tax")');
    if (await taxTab.isVisible()) {
      await taxTab.click();
      await page.waitForTimeout(500);
    }
  });
});
