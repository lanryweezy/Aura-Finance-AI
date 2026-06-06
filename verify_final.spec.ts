import { test, expect } from '@playwright/test';

test.describe('Aura Finance Performance Optimizations Verification', () => {
  test('should verify views and capture screenshots', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('http://localhost:3000');

    // Login
    await page.fill('input[type="email"]', 'test@aura.io');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');

    // Wait for Dashboard
    await page.waitForSelector('h2:has-text("Dashboard")', { timeout: 30000 });
    await page.screenshot({ path: 'v_dashboard_final.png' });
    console.log('Dashboard screenshot taken');

    // Click Transactions
    await page.click('text=Transactions');
    await page.waitForSelector('h2:has-text("Transactions Ledger")', { timeout: 15000 });
    await page.screenshot({ path: 'v_transactions_final.png' });
    console.log('Transactions screenshot taken');

    // Click Accounting
    await page.click('text=Accounting');
    await page.waitForTimeout(1000);
    // Click Audit Trail
    await page.click('text=Audit Trail');
    await page.waitForSelector('h2:has-text("Audit Trail")', { timeout: 15000 });
    await page.screenshot({ path: 'v_audit_trail_final.png' });
    console.log('Audit Trail screenshot taken');

    // Click Reports
    await page.click('text=Reports');
    await page.waitForSelector('h1:has-text("Financial Reports")', { timeout: 15000 });
    await page.screenshot({ path: 'v_reports_final.png' });
    console.log('Reports screenshot taken');
  });
});
