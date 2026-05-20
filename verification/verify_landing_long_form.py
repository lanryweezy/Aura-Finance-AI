
from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    page.set_viewport_size({"width": 1280, "height": 800})
    page.goto("http://localhost:3002")
    page.wait_for_timeout(5000)

    # 1. Landing Page Hero
    page.screenshot(path="verification/screenshots/landing_hero.png")

    # 2. Scroll to Advantage (Problem vs Solution)
    page.get_by_text("The Aura Advantage").scroll_into_view_if_needed()
    page.wait_for_timeout(1000)
    page.screenshot(path="verification/screenshots/landing_advantage.png")

    # 3. Scroll to Feature Deep Dive
    page.get_by_text("Payroll for the Modern Nigerian Business").scroll_into_view_if_needed()
    page.wait_for_timeout(1000)
    page.screenshot(path="verification/screenshots/landing_deep_dive.png")

    # 4. Scroll to Metrics
    page.get_by_text("Transactions Processed").scroll_into_view_if_needed()
    page.wait_for_timeout(1000)
    page.screenshot(path="verification/screenshots/landing_metrics.png")

    # 5. Scroll to Security
    page.get_by_text("Bank-Grade Security").scroll_into_view_if_needed()
    page.wait_for_timeout(1000)
    page.screenshot(path="verification/screenshots/landing_security.png")

    # 6. Scroll to Mobile
    page.get_by_text("Aura Everywhere").scroll_into_view_if_needed()
    page.wait_for_timeout(1000)
    page.screenshot(path="verification/screenshots/landing_mobile.png")

    page.wait_for_timeout(1000)

if __name__ == "__main__":
    os.makedirs("verification/screenshots", exist_ok=True)
    os.makedirs("/home/jules/verification/videos", exist_ok=True)
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
