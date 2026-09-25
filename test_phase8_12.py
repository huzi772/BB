import time
from playwright.sync_api import sync_playwright

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})

        print("1. Navigating to Gift Center via dev jumper...")
        page.goto("http://localhost:5173/?dev=1")
        page.wait_for_timeout(1000)

        # Click DEV jumper for 'gifts'
        page.get_by_role("button", name="gifts").click()
        page.wait_for_timeout(1000)

        page.screenshot(path="/home/jules/verification/1_gift_center.png")
        print("Captured Gift Center screenshot.")

        # Test Gift 0: A Little Message
        print("2. Opening Gift 0 (A Little Message)...")
        page.get_by_text("A Little Message").click()
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/2_gift_message.png")

        # Close overlay
        page.get_by_role("button", name="← Back").click()
        page.wait_for_timeout(800)

        # Test Gift 1: Memories
        print("3. Opening Gift 1 (Memories)...")
        page.get_by_text("Memories").click()
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/3_memory_gallery.png")

        # Click next memory arrow
        page.get_by_role("button", name="Next Memory").click()
        page.wait_for_timeout(600)
        page.screenshot(path="/home/jules/verification/4_memory_gallery_next.png")

        # Close overlay
        page.get_by_role("button", name="← Back").click()
        page.wait_for_timeout(800)

        # Test Gift 2: Letter
        print("4. Opening Gift 2 (Something From Me / Letter)...")
        page.get_by_text("Something From Me").click()
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/5_letter_closed.png")

        # Open envelope
        page.get_by_text("Click to Open Letter").click()
        page.wait_for_timeout(1500)
        page.screenshot(path="/home/jules/verification/6_letter_opened.png")

        # Close overlay
        page.get_by_role("button", name="← Back").click()
        page.wait_for_timeout(800)

        # Click CONTINUE to go to final scene
        print("5. Navigating to Final Scene...")
        page.get_by_role("button", name="CONTINUE").click()
        page.wait_for_timeout(4000) # wait for intro line + final message
        page.screenshot(path="/home/jules/verification/7_final_message.png")

        page.wait_for_timeout(5000) # wait for fireworks + celebration
        page.screenshot(path="/home/jules/verification/8_final_fireworks.png")

        page.wait_for_timeout(6000) # wait for watch again button
        page.screenshot(path="/home/jules/verification/9_watch_again.png")

        # Click Watch Again
        print("6. Clicking Watch Again...")
        watch_btn = page.get_by_role("button", name="Watch Again ↻")
        if watch_btn.is_visible():
            watch_btn.click()
            page.wait_for_timeout(1000)
            page.screenshot(path="/home/jules/verification/10_back_to_entry.png")
            print("Successfully navigated back to entry scene!")

        browser.close()

if __name__ == "__main__":
    run_verification()
