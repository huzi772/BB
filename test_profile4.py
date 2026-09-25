import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        await page.goto('http://localhost:5173/?dev=1')
        await page.wait_for_selector('button:has-text("Cake")')

        await page.click('button:has-text("Cake")')
        await page.wait_for_timeout(4500)

        # Blow candles
        await page.click('button:has-text("BLOW THE CANDLES")')
        await page.wait_for_timeout(3500)

        # Check what scene is rendered in DOM
        current_scene_info = await page.evaluate("""
            () => {
                const h2 = document.querySelector('h2');
                const canvasList = Array.from(document.querySelectorAll('canvas'));
                return {
                    h2Text: h2 ? h2.innerText : null,
                    canvasCount: canvasList.length,
                    sceneElements: Array.from(document.querySelectorAll('.scene')).map(s => s.innerHTML.substring(0, 100))
                };
            }
        """)
        print("DOM state after transition:", current_scene_info)

        await browser.close()

asyncio.run(run())
