import { test, expect } from '@playwright/test';

test('verify performance optimizations and virtualization', async ({ page }) => {
  test.setTimeout(120000);

  // Inject auth state and tour completion to bypass overlays
  await page.goto('http://localhost:3000');
  await page.evaluate(() => {
    localStorage.setItem('aura_user', JSON.stringify({
      id: 'u_123',
      name: 'Test User',
      email: 'test@aura.io',
      role: 'Owner',
      organizationId: 'org_123',
      avatarUrl: 'https://ui-avatars.com/api/?name=Test+User'
    }));
    localStorage.setItem('aura_org', JSON.stringify({
      id: 'org_123',
      name: 'Test Corp',
      plan: 'Growth'
    }));
    localStorage.setItem('aura_tour_completed', 'true');
  });

  // Reload to apply localStorage
  await page.reload();

  // 1. Verify Dashboard (Lazy loading & Memoization)
  await expect(page.locator('h2:has-text("Dashboard")')).toBeVisible({ timeout: 15000 });
  await page.screenshot({ path: 'screenshots/dashboard_empty.png' });

  // 2. Link Bank Account to get data
  // Click the parent menu "Connections"
  await page.click('button:has-text("Connections")');
  // Click the child menu "Bank Connections"
  await page.click('button:has-text("Bank Connections")');

  await page.click('button:has-text("Link New Account")');
  await page.click('button:has-text("Connect with Mono")');

  // Wait for connection to be established
  await page.waitForSelector('text=Healthy', { timeout: 20000 });
  await page.screenshot({ path: 'screenshots/connections_linked.png' });

  // 3. Verify Transactions Virtualization
  await page.click('button:has-text("Transactions")');
  await expect(page.locator('h2:has-text("Transactions Ledger")')).toBeVisible();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/transactions_virtual.png' });

  // 4. Verify Audit Trail Virtualization
  await page.click('button:has-text("Accounting")');
  await page.click('button:has-text("Audit Trail")');
  await expect(page.locator('h2:has-text("Audit Trail")')).toBeVisible();
  await page.screenshot({ path: 'screenshots/audit_trail_virtual.png' });

  // 5. Verify Lazy Loading of Charts on Dashboard
  await page.click('button:has-text("Dashboard")');
  const chart = page.locator('.recharts-responsive-container');
  await expect(chart).toBeVisible({ timeout: 20000 });
  await page.screenshot({ path: 'screenshots/dashboard_with_chart.png' });

  console.log('Performance optimization verification complete.');
});
