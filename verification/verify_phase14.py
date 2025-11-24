from playwright.sync_api import sync_playwright, expect
import time
import re

def verify_ux():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto("http://localhost:5173")
        expect(page.locator(".editron-editor")).to_be_visible()

        # 1. Test Slash Menu Keyboard Navigation
        # Clear storage and reload
        page.locator("#clear-storage-btn").click()
        page.reload()

        # Focus editor
        paragraph = page.locator(".ce-paragraph").first
        paragraph.click()
        paragraph.fill("")
        page.keyboard.type("/")

        menu = page.locator(".editron-slash-menu")
        expect(menu).to_be_visible()

        # Check initial selection (first item: Heading 1)
        items = menu.locator(".menu-item")

        # Wait for "selected" class to appear
        expect(items.nth(0)).to_have_class(re.compile(r"selected"))

        # Arrow Down -> Heading 2
        page.keyboard.press("ArrowDown")
        expect(items.nth(1)).to_have_class(re.compile(r"selected"))
        expect(items.nth(0)).not_to_have_class(re.compile(r"selected"))

        # Arrow Down again -> Heading 3
        page.keyboard.press("ArrowDown")
        expect(items.nth(2)).to_have_class(re.compile(r"selected"))

        # Arrow Up -> Heading 2
        page.keyboard.press("ArrowUp")
        expect(items.nth(1)).to_have_class(re.compile(r"selected"))

        # Enter -> Select Heading 2
        page.keyboard.press("Enter")

        # Verify change to H2
        expect(page.locator("h2.ce-header")).to_be_visible()

        # 2. Verify Accessibility Attributes
        # Inline Toolbar buttons
        p1 = page.locator("h2.ce-header").first
        p1.fill("My Title")

        # Programmatically select text to ensure selection event fires
        page.evaluate("""() => {
            const h2 = document.querySelector('h2.ce-header');
            if (h2) {
                const range = document.createRange();
                range.selectNodeContents(h2);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                // Dispatch selectionchange if needed, though browser usually handles it
                document.dispatchEvent(new Event('selectionchange'));
                // Trigger mouseup which usually checks selection in editors
                h2.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            }
        }""")

        # Wait for toolbar
        toolbar = page.locator(".editron-inline-toolbar")
        expect(toolbar).to_be_visible()

        # Check aria-label
        bold_btn = toolbar.locator("button[data-cmd='bold']")
        expect(bold_btn).to_have_attribute("aria-label", "Bold")
        expect(bold_btn).to_have_attribute("title", "Bold")

        # Check role on editor
        editor = page.locator("#editorjs")
        expect(editor).to_have_attribute("role", "textbox")
        expect(editor).to_have_attribute("aria-multiline", "true")

        # 3. Mobile Responsiveness check (screen size)
        page.set_viewport_size({"width": 375, "height": 667})
        expect(page.locator(".editron-editor")).to_be_visible()

        page.screenshot(path="verification/phase14_ux.png")

        browser.close()

if __name__ == "__main__":
    verify_ux()
