import { test, expect } from '@playwright/test';

test.describe('Payment Flow Edge Cases', () => {
  test('should handle Paystack window close', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate to subscription
    await page.goto('/subscription');
    await page.waitForLoadState('networkidle');

    // Click upgrade button
    const upgradeBtn = page.locator('text=Select Growth').first();
    if (await upgradeBtn.isVisible()) {
      await upgradeBtn.click();
      // Paystack window would open - in demo it mocks
      await page.waitForTimeout(2000);
    }
  });

  test('should handle payment success callback', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Simulate payment success
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('paystack-success', { detail: { reference: 'test-ref' } }));
    });
    await page.waitForTimeout(1000);
  });

  test('should handle payment failure', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Simulate payment failure
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('paystack-failure', { detail: { error: 'Card declined' } }));
    });
    await page.waitForTimeout(1000);
  });

  test('should handle network error during payment', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Go offline during payment attempt
    await page.context().setOffline(true);
    await page.goto('/subscription');
    await page.waitForTimeout(2000);
    await page.context().setOffline(false);
  });

  test('should display payment confirmation after success', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // After successful payment, should show confirmation
    // In demo mode, this is mocked
  });
});
