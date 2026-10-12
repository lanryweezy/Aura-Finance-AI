import { test, expect } from '@playwright/test';

test('Referrals view works', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1000);

  // Login
  await page.fill('input[type="email"]', 'admin@aura.ai');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Sign In")');
  await page.waitForTimeout(2000);

  // Navigate to Referrals
  await page.click('button:has-text("Invite Friends")');
  await page.waitForTimeout(2000);

  // Take screenshot
  await page.screenshot({ path: 'verification/screenshots/referral_dashboard.png' });
});
