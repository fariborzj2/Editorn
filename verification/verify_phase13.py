from playwright.sync_api import sync_playwright, expect
import time

def verify_undo_redo():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto("http://localhost:5173")
        expect(page.locator(".editron-editor")).to_be_visible()

        # Clear initial state
        page.locator("#clear-storage-btn").click()
        page.reload()

        p1 = page.locator(".ce-paragraph").first

        # 1. Type "Hello"
        p1.click()
        p1.fill("")
        p1.type("Hello")

        # Wait for debounce (500ms) + save
        time.sleep(1)

        # 2. Type " World"
        p1.type(" World")
        time.sleep(1)

        expect(p1).to_have_text("Hello World")

        # 3. Undo (Ctrl+Z)
        page.keyboard.press("Control+z")

        # Should revert to "Hello"
        expect(p1).to_have_text("Hello")

        # 4. Redo (Ctrl+Shift+Z)
        page.keyboard.press("Control+Shift+z")

        # Should revert to "Hello World"
        expect(p1).to_have_text("Hello World")

        page.screenshot(path="verification/phase13_undo.png")

        browser.close()

if __name__ == "__main__":
    verify_undo_redo()
