import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        # 1. Test Desktop Flow
        context_desktop = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page_desktop = await context_desktop.new_page()

        print("Testing Desktop Flow...")
        await page_desktop.goto('http://localhost:5173/')
        await page_desktop.wait_for_selector('button:has-text("ENTER THE EXPERIENCE")')
        await page_desktop.click('button:has-text("ENTER THE EXPERIENCE")')

        await page_desktop.wait_for_selector('button:has-text("BLOW THE CANDLES")', timeout=25000)
        await page_desktop.click('button:has-text("BLOW THE CANDLES")')

        await page_desktop.wait_for_selector('h2:has-text("HAPPY BIRTHDAY")', timeout=10000)
        await page_desktop.screenshot(path='/home/jules/verification/reveal_desktop_smooth.png')
        print("Captured Desktop BirthdayReveal screenshot.")

        # 2. Test Mobile Flow
        context_mobile = await browser.new_context(viewport={'width': 375, 'height': 812}, is_mobile=True)
        page_mobile = await context_mobile.new_page()

        print("Testing Mobile Flow...")
        await page_mobile.goto('http://localhost:5173/?dev=1')
        await page_mobile.click('button:has-text("Cake")')
        await page_mobile.wait_for_selector('button:has-text("BLOW THE CANDLES")', timeout=10000)
        await page_mobile.click('button:has-text("BLOW THE CANDLES")')

        await page_mobile.wait_for_selector('h2:has-text("HAPPY BIRTHDAY")', timeout=10000)
        await page_mobile.screenshot(path='/home/jules/verification/reveal_mobile_smooth.png')
        print("Captured Mobile BirthdayReveal screenshot.")

        await browser.close()

asyncio.run(run())
