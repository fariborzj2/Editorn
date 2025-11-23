from playwright.sync_api import sync_playwright, expect
import time

def verify_phase8():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page1 = context.new_page()

        # Listen to console
        page1.on("console", lambda msg: print(f"P1: {msg.text}"))

        # 1. Setup Page 1
        page1.goto("http://localhost:5173")
        expect(page1.locator(".editron-editor")).to_be_visible()

        # Clear storage
        page1.locator("#clear-storage-btn").click()
        page1.reload()

        p1_para = page1.locator(".ce-paragraph").first
        p1_para.click()
        p1_para.type("Hello")

        time.sleep(2.5)

        # 2. Open Page 2
        page2 = context.new_page()
        page2.on("console", lambda msg: print(f"P2: {msg.text}"))
        page2.goto("http://localhost:5173")

        p2_para = page2.locator(".ce-paragraph").first
        expect(p2_para).to_contain_text("Hello")

        # 3. Test Real-time Sync
        print("Typing ' World' in P1...")
        p1_para.type(" World")

        time.sleep(1)

        print(f"P2 Text: {p2_para.inner_text()}")
        expect(p2_para).to_contain_text("Hello World")

        # Take screenshots
        print("Taking screenshots...")
        page1.screenshot(path="verification/phase8_p1.png")
        page2.screenshot(path="verification/phase8_p2.png")
        print("Screenshots taken.")

        browser.close()

if __name__ == "__main__":
    verify_phase8()
