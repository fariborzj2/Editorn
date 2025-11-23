from playwright.sync_api import sync_playwright, expect

def verify_slash_menu():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Wait for Vite to start
        page.goto("http://localhost:5173")

        # Wait for editor to load
        expect(page.locator(".editron-editor")).to_be_visible()

        # Focus on the paragraph
        paragraph = page.locator(".ce-paragraph")
        paragraph.click()

        # Clear existing text and type "/"
        paragraph.fill("/")
        paragraph.press("ArrowRight") # Ensure cursor is at end/event triggers?
        # Actually .fill might not trigger keyup. Let's use press sequence or type.
        paragraph.fill("")
        paragraph.type("/")

        # Wait for menu to appear
        menu = page.locator(".editron-slash-menu")
        expect(menu).to_be_visible()

        # Take screenshot of menu
        page.screenshot(path="verification/slash_menu.png")

        # Click "Heading 1"
        page.locator(".menu-item", has_text="Heading 1").click()

        # Check if block changed to Header
        expect(page.locator("h1.ce-header")).to_be_visible()

        # Take screenshot of header
        page.screenshot(path="verification/header_converted.png")

        browser.close()

if __name__ == "__main__":
    verify_slash_menu()
