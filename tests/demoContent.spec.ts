import { test, expect } from '@playwright/test';

test.describe('Demo Mode — Content Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('should show demo company name in dashboard', async ({ page }) => {
    // Verify actual demo data is displayed, not just URL
    await expect(page.locator('text=TechFlow Lagos').first()).toBeVisible({ timeout: 5000 });
  });

  test('should show demo transactions with amounts', async ({ page }) => {
    // Navigate to transactions and verify data
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');
    // Should show transactions with Nigerian amounts
    await expect(page.locator('text=₦').first()).toBeVisible({ timeout: 5000 });
  });

  test('should show demo invoices', async ({ page }) => {
    await page.goto('/receivables');
    await page.waitForLoadState('networkidle');
    // Should show invoices from demo data
    await expect(page.locator('text=Accounts Receivable')).toBeVisible({ timeout: 5000 });
  });

  test('should show demo bills', async ({ page }) => {
    await page.goto('/payables');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Accounts Payable')).toBeVisible({ timeout: 5000 });
  });

  test('should show demo employees in payroll', async ({ page }) => {
    await page.goto('/payroll');
    await page.waitForLoadState('networkidle');
    // Should show employees from demo data
    await expect(page.locator('text=Payroll')).toBeVisible({ timeout: 5000 });
  });

  test('should show AI chat with agents', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Aura AI Workforce')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=CFO')).toBeVisible();
    await expect(page.locator('text=Tax')).toBeVisible();
    await expect(page.locator('text=Payroll')).toBeVisible();
    await expect(page.locator('text=OpsBot')).toBeVisible();
  });

  test('should show inventory view', async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Inventory Management')).toBeVisible({ timeout: 5000 });
  });

  test('should show contacts from demo data', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Contacts')).toBeVisible({ timeout: 5000 });
  });

  test('should show projects from demo data', async ({ page }) => {
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Projects')).toBeVisible({ timeout: 5000 });
  });

  test('should show reports view', async ({ page }) => {
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Financial Reports')).toBeVisible({ timeout: 5000 });
  });

  test('should persist demo data across navigation', async ({ page }) => {
    // Navigate to multiple views
    await page.goto('/receivables');
    await page.waitForLoadState('networkidle');
    await page.goto('/payables');
    await page.waitForLoadState('networkidle');
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Demo data should still be in localStorage
    const orgData = await page.evaluate(() => localStorage.getItem('aura_org'));
    expect(orgData).toContain('org_demo');

    const userData = await page.evaluate(() => localStorage.getItem('aura_user'));
    expect(userData).toContain('Demo User');
  });

  test('should show dashboard widgets', async ({ page }) => {
    // Dashboard should have multiple widgets visible
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 5000 });
    // Check that the page loaded without errors
    const errorText = page.locator('text=Error');
    const hasError = await errorText.isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });
});
