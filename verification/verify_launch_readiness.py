import asyncio
from playwright.async_api import async_playwright
import os

async def verify_readiness():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        # Using a larger viewport for high-fidelity screenshots
        context = await browser.new_context(viewport={'width': 1440, 'height': 900})
        page = await context.new_page()

        # Inject localStorage to skip tour and set plan
        await page.goto('http://localhost:5173') # Vite default port
        await page.evaluate("""() => {
            localStorage.setItem('aura_tour_completed', 'true');
            localStorage.setItem('aura_subscription_plan', 'Enterprise');
        }""")

        # 1. Login Flow (Simulated)
        await page.goto('http://localhost:5173/auth')
        await page.fill('input[type="email"]', 'admin@aura.ai')
        await page.fill('input[type="password"]', 'password')
        await page.click('button[type="submit"]')

        # Handle 2FA
        await page.wait_for_selector('input[placeholder="000000"]')
        await page.fill('input[placeholder="000000"]', '123456')
        await page.click('button:has-text("Verify")')

        # 2. Verify Dashboard Rendering
        await page.wait_for_selector('#dashboard-welcome')
        await page.screenshot(path='verification/screenshots/dashboard_dark.png')
        print("Captured Dashboard (Dark Mode)")

        # 3. Toggle Light Mode
        await page.click('button[aria-label="Switch to light mode"]')
        await asyncio.sleep(1) # Wait for transition
        await page.screenshot(path='verification/screenshots/dashboard_light.png')
        print("Captured Dashboard (Light Mode)")

        # 4. Verify Command Palette (mod+k)
        await page.keyboard.press('Control+k')
        await page.wait_for_selector('input[placeholder*="Search"]')
        await page.fill('input[placeholder*="Search"]', 'Invoice')
        await asyncio.sleep(0.5)
        await page.screenshot(path='verification/screenshots/command_palette_search.png')
        print("Captured Command Palette Search")

        # 5. Verify Navigation (Routing)
        await page.keyboard.press('Escape')
        await page.click('button:has-text("Transactions")')
        await page.wait_for_url('**/transactions')
        await page.screenshot(path='verification/screenshots/transactions_view.png')
        print("Verified Navigation to Transactions")

        # 6. Verify AIChat workforce
        await page.click('button:has-text("Workforce")')
        await page.wait_for_url('**/chat')
        await page.screenshot(path='verification/screenshots/ai_chat_workforce.png')
        print("Verified AI Chat Workforce View")

        await browser.close()

if __name__ == "__main__":
    if not os.path.exists('verification/screenshots'):
        os.makedirs('verification/screenshots')

    asyncio.run(verify_readiness())
