from playwright.sync_api import sync_playwright, expect

def verify_phase5():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto("http://localhost:5173")
        expect(page.locator(".editron-editor")).to_be_visible()

        # 1. Divider Block
        paragraph = page.locator(".ce-paragraph").first
        paragraph.click()
        paragraph.fill("") # Clear text
        paragraph.type("/")

        # Wait for menu
        menu = page.locator(".editron-slash-menu")
        expect(menu).to_be_visible()

        page.locator(".menu-item", has_text="Divider").click()

        divider = page.locator(".ce-divider")
        expect(divider).to_be_visible()

        # Refresh for Code Block test
        page.reload()
        expect(page.locator(".editron-editor")).to_be_visible()

        paragraph = page.locator(".ce-paragraph").first
        paragraph.click()
        paragraph.fill("") # Clear text
        paragraph.type("/")
        page.locator(".menu-item", has_text="Code Block").click()

        code = page.locator(".ce-code")
        expect(code).to_be_visible()
        code.type("console.log('Hello');")

        # 3. HTML Export
        page.locator("#export-html-btn").click()
        output = page.locator("#output")
        expect(output).to_contain_text("<pre><code>console.log('Hello');</code></pre>")

        page.screenshot(path="verification/phase5.png")

        browser.close()

if __name__ == "__main__":
    verify_phase5()
