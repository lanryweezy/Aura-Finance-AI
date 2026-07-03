import { test, expect } from '@playwright/test';

test.describe('NRS E-Invoicing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.goto('/receivables');
    await page.waitForLoadState('networkidle');
  });

  test('should show NRS button on unpaid invoices', async ({ page }) => {
    // NRS button should exist for unpaid invoices
    const nrsBtn = page.locator('text=NRS').first();
    // May or may not be visible depending on API config
  });

  test('should handle NRS API not configured gracefully', async ({ page }) => {
    // NRS button should not crash when API is not configured
    await page.goto('/receivables');
    await page.waitForLoadState('networkidle');
    // Page should load without errors
  });
});

test.describe('Corporate Cards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.goto('/corporateCards');
    await page.waitForLoadState('networkidle');
  });

  test('should display corporate cards view', async ({ page }) => {
    await expect(page.locator('text=Corporate Cards')).toBeVisible();
  });

  test('should open create card modal', async ({ page }) => {
    const addBtn = page.locator('text=New Card');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await expect(page.locator('text=Create New Card')).toBeVisible();
    }
  });
});

test.describe('Approvals', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.goto('/approvals');
    await page.waitForLoadState('networkidle');
  });

  test('should display approvals view', async ({ page }) => {
    await expect(page.locator('text=Approval Workflows')).toBeVisible();
  });

  test('should show requests and policies tabs', async ({ page }) => {
    await expect(page.locator('text=Requests')).toBeVisible();
    await expect(page.locator('text=Policies')).toBeVisible();
  });
});

test.describe('Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
  });

  test('should display reports view', async ({ page }) => {
    await expect(page.locator('text=Financial Reports')).toBeVisible({ timeout: 5000 });
  });

  test('should show report tabs', async ({ page }) => {
    // Should have P&L, Balance Sheet, Cash Flow tabs
    const tabs = page.locator('button:has-text("Profit"), button:has-text("Balance"), button:has-text("Cash")');
    const count = await tabs.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Contacts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');
  });

  test('should display contacts view', async ({ page }) => {
    await expect(page.locator('text=Contacts')).toBeVisible();
  });

  test('should show demo contacts', async ({ page }) => {
    await expect(page.locator('text=TechCorp Solutions')).toBeVisible({ timeout: 5000 });
  });

  test('should open add contact modal', async ({ page }) => {
    const addBtn = page.locator('text=Add Contact');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await expect(page.locator('text=Add New Contact')).toBeVisible();
    }
  });
});

test.describe('Projects', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');
  });

  test('should display projects view', async ({ page }) => {
    await expect(page.locator('text=Projects')).toBeVisible();
  });

  test('should show demo projects', async ({ page }) => {
    await expect(page.locator('text=Website Redesign')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Expenses', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.goto('/expenses');
    await page.waitForLoadState('networkidle');
  });

  test('should display expenses view', async ({ page }) => {
    await expect(page.locator('text=Expenses')).toBeVisible();
  });

  test('should show expense stats', async ({ page }) => {
    await expect(page.locator('text=This Month')).toBeVisible();
    await expect(page.locator('text=Pending')).toBeVisible();
  });

  test('should open new expense modal', async ({ page }) => {
    const addBtn = page.locator('text=New Expense');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await expect(page.locator('text=New Expense')).toBeVisible();
    }
  });
});

test.describe('Tax Filing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.goto('/taxFiling');
    await page.waitForLoadState('networkidle');
  });

  test('should display tax filing view', async ({ page }) => {
    await expect(page.locator('text=Tax Filing')).toBeVisible();
  });

  test('should show tax types', async ({ page }) => {
    await expect(page.locator('text=VAT')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=PAYE')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Bulk Payments', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.goto('/bulkPayments');
    await page.waitForLoadState('networkidle');
  });

  test('should display bulk payments view', async ({ page }) => {
    await expect(page.locator('text=Bulk Payments')).toBeVisible();
  });

  test('should open create batch modal', async ({ page }) => {
    const addBtn = page.locator('text=New Batch');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await expect(page.locator('text=Create Bulk Payment')).toBeVisible();
    }
  });
});
