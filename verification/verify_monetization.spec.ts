import { test, expect } from '@playwright/test';

test('Monetization Gating - Free Plan', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Login as demo user (default Enterprise)
  await page.fill('input[type="email"]', 'demo@aura.ai');
  await page.fill('input[type="password"]', 'password');
  await page.click('button:has-text("Sign In")');

  // Handle 2FA
  await page.waitForSelector('input[placeholder="000000"]');
  await page.fill('input[placeholder="000000"]', '123456');
  await page.click('button:has-text("Verify")');

  // Wait for Dashboard
  await page.waitForSelector('text=Financial Performance');

  // Dismiss Onboarding if it appears
  try {
    await page.keyboard.press('Escape');
    await page.click('button:has-text("Skip Tour")', { timeout: 2000 });
  } catch (e) {}

  // Go to Subscription page and Downgrade to Free to test gating
  // Note: Sidebar items might be hidden or have different text on mobile/desktop
  // Using more robust selectors
  await page.locator('nav').locator('button:has-text("Subscription")').click();
  await page.waitForSelector('text=Choose the right plan');

  // Click "Select Plan" for Starter (Free)
  const selectPlanButtons = page.locator('button:has-text("Select Plan")');
  await selectPlanButtons.first().click();

  // Wait for plan update
  await page.waitForTimeout(2000);

  // Now try to access Inventory (which is restricted for Free)
  await page.locator('button:has-text("Purchases")').click();
  await page.locator('button:has-text("Products & Services")').click();

  // Check for Upgrade Overlay
  await page.waitForSelector('text=Inventory Management');
  await expect(page.locator('text=Upgrade Required')).toBeVisible();

  await page.screenshot({ path: 'verification/screenshots/monetization_gated_free.png', fullPage: true });

  // Now Upgrade to Growth via the overlay button
  await page.click('button:has-text("Upgrade to Growth")');

  // Should be back on Subscription page
  await page.waitForSelector('text=Choose the right plan');

  // Select Growth (Middle one) - It might say "Select Plan" or "Current Plan"
  // but since we are currently "Free", it should say "Select Plan"
  await page.locator('button:has-text("Select Plan")').first().click(); // Growth is now first available upgrade
  await page.waitForTimeout(2000);

  // Now Inventory should be visible without overlay
  await page.locator('button:has-text("Purchases")').click();
  await page.locator('button:has-text("Products & Services")').click();

  // The "Upgrade Required" text should NOT be present
  await expect(page.locator('text=Upgrade Required')).not.toBeVisible();

  await page.screenshot({ path: 'verification/screenshots/monetization_unlocked_growth.png', fullPage: true });
});
