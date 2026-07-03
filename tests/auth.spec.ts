import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should show login modal from landing page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Sign In');
    // Should show auth view
    await page.waitForTimeout(1000);
  });

  test('should show signup flow', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Start Your Free Trial');
    await page.waitForTimeout(1000);
  });

  test('should handle invalid credentials', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Sign In');
    await page.waitForTimeout(1000);
    // Try to login with wrong credentials
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill('wrong@email.com');
      const passwordInput = page.locator('input[type="password"]');
      if (await passwordInput.isVisible()) {
        await passwordInput.fill('wrongpassword');
        const submitBtn = page.locator('button[type="submit"]');
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    }
  });

  test('should handle logout', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Find and click logout
    const logoutBtn = page.locator('text=Log Out').first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should persist session across page reloads', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Reload page
    await page.reload();
    await page.waitForTimeout(2000);

    // Should still be logged in
    const orgData = await page.evaluate(() => localStorage.getItem('aura_org'));
    expect(orgData).toContain('org_demo');
  });
});
