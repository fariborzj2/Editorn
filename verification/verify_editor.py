from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Go to the editor with Persian locale
        print("Navigating to editor...")
        page.goto("http://localhost:5173/?locale=fa")

        # Wait for editor to load
        editor = page.locator("#editorjs")
        expect(editor).to_be_visible()

        # Give it a moment for JS to initialize blocks
        page.wait_for_timeout(1000)

        # Find the first paragraph (contenteditable div)
        # Adjust selector based on common editor js structures or the css I read
        # CSS showed .ce-paragraph
        first_block = page.locator(".ce-paragraph").first

        if not first_block.is_visible():
             # If no block, maybe click editor to focus/init
             editor.click()
             first_block = page.locator(".ce-paragraph").first

        print("Typing text...")
        first_block.click()
        first_block.type("سلام. این یک متن نمونه است برای نمایش ادیتور.")

        # Create a new block
        page.keyboard.press("Enter")
        page.wait_for_timeout(500)

        # Add a header
        page.keyboard.type("/header")
        page.wait_for_timeout(500) # wait for menu
        page.keyboard.press("Enter") # select header
        page.wait_for_timeout(200)
        page.keyboard.type("عنوان آزمایشی")

        # Add a checklist
        page.keyboard.press("Enter")
        page.keyboard.type("/checklist")
        page.wait_for_timeout(500)
        page.keyboard.press("Enter")
        page.keyboard.type("این یک مورد چک‌لیست است")


        print("Taking screenshot...")
        page.wait_for_timeout(1000) # wait for rendering
        page.screenshot(path="verification/editor_screenshot.png")

        browser.close()
        print("Done.")

if __name__ == "__main__":
    run()
