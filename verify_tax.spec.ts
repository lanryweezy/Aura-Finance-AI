import { test, expect } from '@playwright/test';

test.describe('Tax Command Center & Agentic Features Verification', () => {
  test('should verify tax center tabs and compliance widgets', async ({ page }) => {
    test.setTimeout(120000);

    // Go to landing page
    await page.goto('/');

    // Auth - Use Google login which is simulated/mocked in authService
    await page.click('button:has-text("Get Started")');
    await page.click('button:has-text("Continue with Google")');

    // Wait for Dashboard h2 specifically
    await page.waitForSelector('h2:has-text("Dashboard")', { timeout: 45000 });

    // Verify TaxPro on Dashboard
    await page.waitForSelector('h3:has-text("TaxPro Agent")', { timeout: 30000 });
    await page.screenshot({ path: 'v_taxpro_dashboard.png' });
    console.log('TaxPro Agent found on Dashboard');

    // Handle the "Welcome to Aura" tour/modal if it appears
    try {
        await page.waitForSelector('button:has-text("Skip Tour")', { timeout: 5000 });
        await page.click('button:has-text("Skip Tour")');
        console.log('Skipped tour modal');
    } catch (e) {
        console.log('No tour modal appeared or already cleared');
    }

    // Navigate to Tax Command Center - The label in Sidebar is "Tax Filing"
    await page.click('button:has-text("Tax Filing")');
    await page.waitForSelector('h2:has-text("Tax Command Center")', { timeout: 15000 });

    // Verify Compliance Calendar
    await expect(page.locator('h3:has-text("Compliance Calendar (Nigeria)")')).toBeVisible();
    await expect(page.locator('text=94% Compliant')).toBeVisible();

    // Take screenshot of summary
    await page.screenshot({ path: 'v_tax_center_summary.png' });

    // Test Tabs
    const tabs = ['VAT', 'WHT', 'CIT', 'PAYE'];
    for (const tab of tabs) {
        await page.click(`button:has-text("${tab}")`);
        await page.waitForTimeout(500);
        await page.screenshot({ path: `v_tax_center_${tab.toLowerCase()}.png` });
        console.log(`Verified ${tab} tab`);
    }

    // Verify Chat Agent
    await page.click('button:has-text("O-Heidi AI")');
    await page.waitForSelector('h2:has-text("Chat with O-Heidi AI")', { timeout: 15000 });
    await page.screenshot({ path: 'v_ai_chat_tax.png' });
  });
});
