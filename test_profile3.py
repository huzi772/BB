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

        # Count active requestAnimationFrame calls or check R3F root state
        webgl_info_before = await page.evaluate("""
            () => {
                const canvases = Array.from(document.querySelectorAll('canvas'));
                return canvases.map(c => ({
                    w: c.width,
                    h: c.height,
                    gl: !!c.getContext('webgl') || !!c.getContext('webgl2')
                }));
            }
        """)
        print("Webgl before transition:", webgl_info_before)

        # Click Blow
        blow_btn = page.locator('button:has-text("BLOW THE CANDLES")')
        if await blow_btn.is_visible():
            await blow_btn.click()
            # Wait 3.5s for transition to reveal to finish
            await page.wait_for_timeout(3500)

        # Check canvases and WebGL state after transition
        webgl_info_after = await page.evaluate("""
            () => {
                const canvases = Array.from(document.querySelectorAll('canvas'));
                return canvases.map(c => ({
                    w: c.width,
                    h: c.height,
                    gl: !!c.getContext('webgl') || !!c.getContext('webgl2')
                }));
            }
        """)
        print("Webgl after transition:", webgl_info_after)

        await browser.close()

asyncio.run(run())
