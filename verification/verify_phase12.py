from playwright.sync_api import sync_playwright, expect
import time

def verify_advanced_content():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto("http://localhost:5173")
        expect(page.locator(".editron-editor")).to_be_visible()

        # 1. Test HTML Paste
        html_content = "<h2>Pasted Header</h2><p>Pasted paragraph.</p>"

        # Focus editor
        paragraph = page.locator(".ce-paragraph").first
        paragraph.click()
        paragraph.fill("") # Clear

        page.evaluate(f"""
            const data = new DataTransfer();
            data.setData('text/html', '{html_content}');
            const event = new ClipboardEvent('paste', {{
                clipboardData: data,
                bubbles: true,
                cancelable: true
            }});
            document.querySelector('.editron-editor').dispatchEvent(event);
        """)

        # Verify conversion
        expect(page.locator("h2.ce-header")).to_contain_text("Pasted Header")
        expect(page.locator(".ce-paragraph", has_text="Pasted paragraph.")).to_be_visible()

        # 2. Test Video Block
        # Create new line
        page.locator("h2.ce-header").click()
        page.keyboard.press("Enter")

        # Type / to open menu (don't type video as it closes menu in this implementation)
        page.keyboard.type("/")

        # Select Video Embed from menu
        page.locator(".menu-item", has_text="Video Embed").click()

        # Check input
        video_input = page.locator(".ce-video-input")
        expect(video_input).to_be_visible()

        # Enter YouTube URL
        video_input.fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        video_input.press("Enter")

        # Check iframe
        iframe = page.locator(".ce-video")
        expect(iframe).to_be_visible()
        # Check src (should be embed version)
        expect(iframe).to_have_attribute("src", "https://www.youtube.com/embed/dQw4w9WgXcQ")

        page.screenshot(path="verification/phase12.png")

        browser.close()

if __name__ == "__main__":
    verify_advanced_content()
