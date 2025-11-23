from playwright.sync_api import sync_playwright, expect

def verify_media_blocks():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto("http://localhost:5173")
        expect(page.locator(".editron-editor")).to_be_visible()

        # 1. Test Quote Block
        paragraph = page.locator(".ce-paragraph").first
        paragraph.click()
        paragraph.fill("")
        paragraph.type("/")
        page.locator(".menu-item", has_text="Quote").click()

        quote = page.locator(".ce-quote")
        expect(quote).to_be_visible()
        quote.type("This is a famous quote.")

        # 2. Test Image Block
        # Create new block after quote (Enter logic)
        quote.press("Enter")

        # There should be exactly one paragraph now (the new one)
        paragraph_new = page.locator(".ce-paragraph").first
        expect(paragraph_new).to_be_visible()
        paragraph_new.type("/")
        page.locator(".menu-item", has_text="Image").click()

        image_input = page.locator(".ce-image-input")
        expect(image_input).to_be_visible()

        # Use a placeholder image
        image_input.fill("https://via.placeholder.com/300")
        image_input.press("Enter")

        image = page.locator(".ce-image")
        expect(image).to_be_visible()

        # 3. Test Markdown Export
        page.locator("#export-md-btn").click()
        output = page.locator("#output")
        expect(output).to_contain_text("> This is a famous quote.")
        # Default fallback caption is 'image'
        expect(output).to_contain_text("![image](https://via.placeholder.com/300)")

        page.screenshot(path="verification/media_blocks.png")

        browser.close()

if __name__ == "__main__":
    verify_media_blocks()
