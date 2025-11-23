from playwright.sync_api import sync_playwright, expect

def verify_toolbar_and_list():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto("http://localhost:5173")
        expect(page.locator(".editron-editor")).to_be_visible()

        # 1. Verify List creation via Slash Menu
        paragraph = page.locator(".ce-paragraph").first
        paragraph.click()
        paragraph.fill("")
        paragraph.type("/")

        menu = page.locator(".editron-slash-menu")
        expect(menu).to_be_visible()

        page.locator(".menu-item", has_text="Bulleted List").click()

        # Check if list exists
        ul = page.locator("ul.ce-list")
        expect(ul).to_be_visible()
        expect(ul.locator("li.ce-list-item")).to_be_visible()

        # Type in list
        li = ul.locator("li").first
        li.type("Item 1")

        # 2. Verify Inline Toolbar
        # Manually select text to ensure selection event fires
        li.evaluate("""element => {
            const range = document.createRange();
            range.selectNodeContents(element);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }""")

        # Trigger selectionchange if needed (programmatic selection might not trigger it in all browsers/versions the same way, but usually does)
        # But our plugin listens to document.selectionchange.

        toolbar = page.locator(".editron-inline-toolbar")
        expect(toolbar).to_be_visible()

        page.screenshot(path="verification/toolbar_and_list.png")

        browser.close()

if __name__ == "__main__":
    verify_toolbar_and_list()
