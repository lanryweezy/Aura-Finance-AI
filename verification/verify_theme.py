
import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async_playwright_instance = await async_playwright().start()
    browser = await async_playwright_instance.chromium.launch()

    context = await browser.new_context(viewport={'width': 1280, 'height': 800})
    page = await context.new_page()

    await context.add_init_script("""
        localStorage.setItem('aura_tour_completed', 'true');
        localStorage.setItem('aura_subscription_plan', 'Enterprise');
    """)

    try:
        print("Navigating to dashboard...")
        await page.goto('http://localhost:5173/auth')
        await page.wait_for_timeout(2000)

        await page.fill('input[type="email"]', 'admin@aura.ai')
        await page.fill('input[type="password"]', 'password')
        await page.click('button:has-text("Sign In")')

        # Wait for the dashboard-welcome ID I added earlier
        await page.wait_for_selector('#dashboard-welcome', timeout=15000)
        print("Dashboard loaded.")
        await page.screenshot(path='verification/dashboard_dark.png')

        toggle_button = page.locator('button[aria-label="Switch to light mode"]')
        await toggle_button.click()
        await page.wait_for_timeout(2000)
        await page.screenshot(path='verification/dashboard_light.png')
        print("Dashboard light captured.")

        await page.keyboard.press('/')
        await page.wait_for_timeout(1000)
        await page.screenshot(path='verification/command_palette.png')
        print("Command palette captured.")

    except Exception as e:
        print(f"Error: {e}")
        await page.screenshot(path='verification/error_state.png')
    finally:
        await browser.close()
        await async_playwright_instance.stop()

if __name__ == "__main__":
    os.makedirs('verification', exist_ok=True)
    asyncio.run(run())
