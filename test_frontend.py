from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('http://localhost:5173/')
    time.sleep(2)
    page.screenshot(path='screenshot.png', full_page=True)
    browser.close()
