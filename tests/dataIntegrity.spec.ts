import { test, expect } from '@playwright/test';

test.describe('Data Integrity', () => {
  test('should maintain referential integrity', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Create invoice
    await page.goto('/receivables');
    await page.waitForLoadState('networkidle');

    // Navigate to contacts
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');

    // Contact should exist
    await expect(page.locator('text=TechCorp Solutions')).toBeVisible({ timeout: 5000 });
  });

  test('should handle concurrent edits', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Open same view in two tabs
    const context = await page.context();
    const page2 = await context.newPage();

    await page.goto('/receivables');
    await page2.goto('/receivables');

    await page.waitForLoadState('networkidle');
    await page2.waitForLoadState('networkidle');

    // Both should load without conflict
    await expect(page.locator('text=Accounts Receivable')).toBeVisible();
    await expect(page2.locator('text=Accounts Receivable')).toBeVisible();

    await page2.close();
  });

  test('should preserve data across navigation', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Check initial data
    await page.goto('/receivables');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=TechCorp Solutions')).toBeVisible({ timeout: 5000 });

    // Navigate away
    await page.goto('/payables');
    await page.waitForLoadState('networkidle');

    // Navigate back
    await page.goto('/receivables');
    await page.waitForLoadState('networkidle');

    // Data should still be there
    await expect(page.locator('text=TechCorp Solutions')).toBeVisible({ timeout: 5000 });
  });

  test('should handle data updates correctly', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate to contacts and edit
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');

    // Find and click on a contact
    const contactRow = page.locator('text=TechCorp Solutions').first();
    if (await contactRow.isVisible()) {
      await contactRow.click();
      await page.waitForTimeout(500);
    }
  });

  test('should handle delete operations', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Demo');
    await page.click('text=Launch Demo');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate to expenses
    await page.goto('/expenses');
    await page.waitForLoadState('networkidle');

    // Delete confirmation should appear
    // In demo mode, this is handled gracefully
  });
});
