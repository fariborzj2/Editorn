from playwright.sync_api import sync_playwright, expect

def verify_editor():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Wait for Vite to start
        page.goto("http://localhost:5173")

        # Wait for editor to load
        expect(page.locator(".editron-editor")).to_be_visible()

        # Check if paragraph is visible
        expect(page.locator(".ce-paragraph")).to_be_visible()

        # Check content
        paragraph = page.locator(".ce-paragraph")
        expect(paragraph).to_contain_text("Welcome to Editron")

        # Take screenshot
        page.screenshot(path="verification/editor.png")

        browser.close()

if __name__ == "__main__":
    verify_editor()
