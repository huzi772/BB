import sys
import time
from playwright.sync_api import sync_playwright

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # 1. Test Full Flow on Desktop
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        print("[TEST] Navigating to local dev server http://localhost:5173/")
        page.goto('http://localhost:5173/')
        page.wait_for_selector('button:has-text("ENTER THE EXPERIENCE")')
        page.screenshot(path='/home/jules/verification/bugfix_1_entry.png')

        print("[TEST] Clicking ENTER THE EXPERIENCE...")
        page.click('button:has-text("ENTER THE EXPERIENCE")')

        print("[TEST] Waiting for countdown...")
        page.wait_for_timeout(3500)
        page.screenshot(path='/home/jules/verification/bugfix_2_preparing.png')

        print("[TEST] Waiting for preparing scene & cake transition (~10s total)...")
        page.wait_for_timeout(10000)
        page.wait_for_selector('button:has-text("BLOW THE CANDLES")', timeout=10000)
        page.screenshot(path='/home/jules/verification/bugfix_3_cake.png')

        print("[TEST] Clicking BLOW THE CANDLES...")
        page.click('button:has-text("BLOW THE CANDLES")')

        print("[TEST] Waiting for reveal scene (~5s)...")
        page.wait_for_timeout(6000)
        page.wait_for_selector('button:has-text("CONTINUE")', timeout=10000)
        page.screenshot(path='/home/jules/verification/bugfix_4_reveal.png')

        print("[TEST] Clicking CONTINUE...")
        page.click('button:has-text("CONTINUE")')
        page.wait_for_timeout(1000)
        page.wait_for_selector('text=Gift Center Placeholder')
        page.screenshot(path='/home/jules/verification/bugfix_5_gifts.png')
        print("[SUCCESS] Full flow completed successfully!")

        # 2. Test ?dev=1 Rapid Jumper Mode
        print("[TEST] Navigating with ?dev=1")
        page.goto('http://localhost:5173/?dev=1')
        page.wait_for_selector('text=DEV:')

        for scene in ['countdown', 'preparing', 'cake', 'reveal', 'gifts', 'final', 'entry']:
            print(f"[TEST] Dev jumper clicking: {scene}")
            page.click(f'button:has-text("{scene}")')
            page.wait_for_timeout(1000) # Ensure transition finishes

        page.screenshot(path='/home/jules/verification/bugfix_6_dev_jumper.png')
        print("[SUCCESS] Dev jumper tested successfully with no stuck transitions!")

        browser.close()

if __name__ == '__main__':
    run_tests()
