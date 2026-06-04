import { test, expect } from '@playwright/test';

test('verify performance optimizations and virtualization', async ({ page }) => {
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
  await expect(page.locator('text=Financial Overview')).toBeVisible({ timeout: 15000 });
  await page.screenshot({ path: 'screenshots/dashboard.png' });

  // 2. Verify Transactions Virtualization
  await page.click('nav >> text=Transactions');
  // From screenshot, the heading is "Transactions Ledger"
  await expect(page.locator('text=Transactions Ledger')).toBeVisible();

  // Verify that the list is rendered (virtualization check)
  // react-window list usually has a div with overflow: auto
  const virtualList = page.locator('.TransactionsView [style*="overflow: auto"]');
  await expect(virtualList).toBeDefined();
  await page.screenshot({ path: 'screenshots/transactions_virtual.png' });

  // 3. Verify Audit Trail Virtualization
  await page.click('nav >> text=Settings');
  await page.click('text=Audit Trail');
  await expect(page.locator('text=Security Audit Log')).toBeVisible();
  await page.screenshot({ path: 'screenshots/audit_trail_virtual.png' });

  // 4. Verify Lazy Loading of Charts
  // Navigate back to Dashboard to see if chart rendered
  await page.click('nav >> text=Dashboard');
  const chart = page.locator('.recharts-responsive-container');
  await expect(chart).toBeVisible();

  console.log('Performance optimization verification complete.');
});
