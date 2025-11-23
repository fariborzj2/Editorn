from playwright.sync_api import sync_playwright, expect
import time

def verify_phase7():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto("http://localhost:5173")
        expect(page.locator(".editron-editor")).to_be_visible()

        # 1. Test Theme Switch
        body = page.locator("body")
        # Default is light (bg #f9f9f9)
        # Check if theme toggle button exists
        toggle = page.locator("#theme-toggle")
        expect(toggle).to_be_visible()

        # Click toggle -> Dark mode
        toggle.click()

        # Wait for transition
        time.sleep(0.5)

        # Verify dark theme attribute
        expect(page.locator("html")).to_have_attribute("data-theme", "dark")

        # 2. Test Drag and Drop
        # Ensure we have at least 2 blocks.
        # Clear storage first to avoid confusion with previous data?
        page.locator("#clear-storage-btn").click()
        page.reload()

        # Create 2 paragraphs
        p1 = page.locator(".ce-paragraph").first
        p1.click()
        p1.type("Block 1")
        p1.press("Enter")

        p2 = page.locator(".ce-paragraph").nth(1)
        p2.type("Block 2")

        # Check order: Block 1, Block 2
        wrappers = page.locator(".ce-block-wrapper")
        expect(wrappers.nth(0)).to_contain_text("Block 1")
        expect(wrappers.nth(1)).to_contain_text("Block 2")

        # Perform Drag
        # We need to drag the handle of Block 1 to Block 2
        handle1 = wrappers.nth(0).locator(".ce-drag-handle")
        target2 = wrappers.nth(1)

        # Playwright drag_to
        handle1.drag_to(target2)

        # Wait for move
        time.sleep(0.5)

        # Check new order: Block 2, Block 1
        # Re-query wrappers
        expect(wrappers.nth(0)).to_contain_text("Block 2")
        expect(wrappers.nth(1)).to_contain_text("Block 1")

        page.screenshot(path="verification/phase7.png")

        browser.close()

if __name__ == "__main__":
    verify_phase7()
