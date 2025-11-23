from playwright.sync_api import sync_playwright, expect
import time

def verify_phase6():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Listen to console
        page.on("console", lambda msg: print(f"BROWSER LOG: {msg.text}"))

        page.goto("http://localhost:5173")
        expect(page.locator(".editron-editor")).to_be_visible()

        # 1. Test Autosave
        paragraph = page.locator(".ce-paragraph").first
        paragraph.click()
        paragraph.type("Test content for autosave.")

        time.sleep(3)

        data = page.evaluate("localStorage.getItem('editron_autosave_data')")
        print(f"LocalStorage Data: {data}")

        # Reload page
        page.reload()
        expect(page.locator(".editron-editor")).to_be_visible()

        paragraph_restored = page.locator(".ce-paragraph").first
        print(f"Restored Text: {paragraph_restored.inner_text()}")

        expect(paragraph_restored).to_contain_text("Test content for autosave.")

        page.locator("#clear-storage-btn").click()

        # 2. Test Table Block
        # We need to create a new table.
        # Clear existing text
        paragraph_restored.fill("")
        paragraph_restored.type("/")
        page.locator(".menu-item", has_text="Table").click()

        table = page.locator(".ce-table")
        expect(table).to_be_visible()

        # Check initial cells (3x2)
        expect(table.locator("tr")).to_have_count(3)
        expect(table.locator("tr").first.locator("td")).to_have_count(2)

        # Type in cell
        cell = table.locator("td").first
        cell.type("Header 1")

        # Add Row
        page.locator("button", has_text="+ Row").click()
        expect(table.locator("tr")).to_have_count(4)

        # Export HTML
        page.locator("#export-html-btn").click()
        output = page.locator("#output")
        expect(output).to_contain_text("<td>Header 1</td>")
        expect(output).to_contain_text("<table>")

        page.screenshot(path="verification/phase6.png")

        browser.close()

if __name__ == "__main__":
    verify_phase6()
