import sys
import time
from playwright.sync_api import sync_playwright

def verify_flames():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        print("[TEST] Navigating directly to cake scene via dev jumper...")
        page.goto('http://localhost:5173/?dev=1')
        page.wait_for_selector('button:has-text("cake")')
        page.click('button:has-text("cake")')

        print("[TEST] Waiting for camera intro animation to complete (~5s)...")
        page.wait_for_timeout(5000)

        # Take close-up screenshot of the cake and candles
        page.screenshot(path='/home/jules/verification/flames_improved_closeup.png')
        print("[SUCCESS] Close-up screenshot of improved flames saved!")

        browser.close()

if __name__ == '__main__':
    verify_flames()
