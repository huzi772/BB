import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        context_desktop = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page_desktop = await context_desktop.new_page()

        await page_desktop.goto('http://localhost:5173/?dev=1')
        await page_desktop.click('button:has-text("Cake")')
        await page_desktop.wait_for_selector('button:has-text("BLOW THE CANDLES")', timeout=10000)
        await page_desktop.click('button:has-text("BLOW THE CANDLES")')

        await page_desktop.wait_for_selector('h2:has-text("HAPPY BIRTHDAY")', timeout=10000)
        await page_desktop.wait_for_timeout(2500) # Wait for text animation to finish
        await page_desktop.screenshot(path='/home/jules/verification/reveal_desktop_final.png')

        await browser.close()

asyncio.run(run())
