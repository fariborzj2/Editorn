from playwright.sync_api import sync_playwright, expect
import time

def verify_ai():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto("http://localhost:5173")
        expect(page.locator(".editron-editor")).to_be_visible()

        # 1. Test AI from Slash Menu
        # Create new block
        page.locator(".ce-paragraph").first.click()
        page.locator(".ce-paragraph").first.fill("")
        page.keyboard.type("/")

        menu = page.locator(".editron-slash-menu")
        expect(menu).to_be_visible()

        page.locator(".menu-item", has_text="Generate Text").click()

        dialog = page.locator(".ce-ai-dialog")
        expect(dialog).to_be_visible()
        expect(dialog).to_contain_text("AI Assistant")

        page.mouse.click(0, 0)
        expect(dialog).to_be_hidden()

        # 2. Test AI from Inline Toolbar
        p1 = page.locator(".ce-paragraph").first
        p1.fill("hello world")

        # Manual selection
        p1.evaluate("""element => {
            const range = document.createRange();
            range.selectNodeContents(element);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }""")

        # Trigger selectionchange? Usually manual selection does it, but dispatch if needed.
        page.evaluate("document.dispatchEvent(new Event('selectionchange'))")

        toolbar = page.locator(".editron-inline-toolbar")
        expect(toolbar).to_be_visible()

        ai_btn = toolbar.locator(".ce-ai-trigger")
        expect(ai_btn).to_be_visible()

        ai_btn.click()

        expect(dialog).to_be_visible()

        fix_btn = dialog.locator("button[data-action='fix']")
        fix_btn.click()

        time.sleep(1.5)

        expect(p1).to_contain_text("Hello world.")

        page.screenshot(path="verification/phase9_ai.png")

        browser.close()

if __name__ == "__main__":
    verify_ai()
