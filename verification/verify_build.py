from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Go to the PREVIEW server
        print("Navigating to preview...")
        page.goto("http://localhost:4173/")

        # Wait for editor
        editor = page.locator("#editorjs")
        expect(editor).to_be_visible()

        # If we see the editor, the JS loaded correctly
        print("Editor loaded successfully in production build preview.")

        browser.close()

if __name__ == "__main__":
    run()
