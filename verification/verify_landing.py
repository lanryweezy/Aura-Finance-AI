
from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    page.goto("http://localhost:3000")
    page.wait_for_timeout(2000)

    # 1. Landing Page Screenshot
    page.screenshot(path="verification/screenshots/landing_page.png")
    page.wait_for_timeout(1000)

    # 2. Go to Sign Up (Get Started)
    page.get_by_role("button", name="Get Started", exact=True).first.click()
    page.wait_for_timeout(1000)
    page.screenshot(path="verification/screenshots/signup_view.png")

    # 3. Go back (refresh or use UI)
    page.goto("http://localhost:3000")
    page.wait_for_timeout(1000)

    # 4. Go to Sign In
    page.get_by_role("button", name="Sign In", exact=True).click()
    page.wait_for_timeout(1000)
    page.screenshot(path="verification/screenshots/login_view.png")

    # 5. Perform a mock login (if possible, or just stay at login view)
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
