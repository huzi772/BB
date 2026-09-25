import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        page.on("console", lambda msg: print(f"[Browser Console] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"[Page Error] {err}"))

        await page.goto('http://localhost:5173/')

        # 1. Entry
        await page.wait_for_selector('button:has-text("ENTER THE EXPERIENCE")')
        await page.click('button:has-text("ENTER THE EXPERIENCE")')

        # 2. Countdown -> Preparing -> Cake
        await page.wait_for_selector('button:has-text("BLOW THE CANDLES")', timeout=15000)
        print("Reached CakeScene successfully!")

        # 3. Blow Candles
        await page.click('button:has-text("BLOW THE CANDLES")')

        # 4. Monitor BirthdayReveal
        await page.wait_for_selector('h2:has-text("HAPPY BIRTHDAY")', timeout=10000)
        print("Reached BirthdayReveal scene!")

        # Verify reveal elements
        h1 = await page.inner_text('h1')
        print("H1 text:", h1)

        await browser.close()

asyncio.run(run())
