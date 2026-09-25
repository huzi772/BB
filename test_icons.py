import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Desktop view
        await page.set_viewport_size({"width": 1280, "height": 800})
        await page.goto("http://localhost:5173/?dev=1")
        await page.wait_for_selector('button:has-text("Gifts")')
        await page.click('button:has-text("Gifts")')
        await page.wait_for_selector('h2:has-text("A Few Things For You")')
        await page.wait_for_timeout(1000)
        await page.screenshot(path="/home/jules/verification/gift_center_icons_desktop.png")

        # Mobile view
        await page.set_viewport_size({"width": 375, "height": 667})
        await page.wait_for_timeout(500)
        await page.screenshot(path="/home/jules/verification/gift_center_icons_mobile.png")

        await browser.close()

asyncio.run(main())
