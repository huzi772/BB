import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        page.on("console", lambda msg: print(f"[Browser Console] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"[Page Error] {err}"))

        await page.goto('http://localhost:5173/?dev=1')
        await page.wait_for_selector('button:has-text("Cake")')

        # Click Cake scene in dev jumper
        await page.click('button:has-text("Cake")')
        await page.wait_for_timeout(4500) # Wait for camera intro

        # Click Blow Candles button
        blow_btn = page.locator('button:has-text("BLOW THE CANDLES")')
        if await blow_btn.is_visible():
            print("Blow button visible, clicking...")
            await blow_btn.click()
            await page.wait_for_timeout(3500) # Wait for blow -> extinguish -> transition to reveal

        # Now in BirthdayReveal scene
        # Monitor FPS during BirthdayReveal animation
        fps_log = await page.evaluate("""
            new Promise((resolve) => {
                let frames = 0;
                let startTime = performance.now();
                let fpsList = [];

                function loop() {
                    frames++;
                    let now = performance.now();
                    if (now - startTime >= 200) {
                        fpsList.push(Math.round((frames * 1000) / (now - startTime)));
                        frames = 0;
                        startTime = now;
                    }
                    if (fpsList.length < 20) {
                        requestAnimationFrame(loop);
                    } else {
                        resolve(fpsList);
                    }
                }
                requestAnimationFrame(loop);
            })
        """)
        print("FPS list during BirthdayReveal:", fps_log)

        # Check canvases in DOM
        canvases = await page.evaluate("Array.from(document.querySelectorAll('canvas')).map(c => ({ width: c.width, height: c.height, id: c.id, class: c.className, style: c.getAttribute('style') }))")
        print("Active canvases in DOM:", canvases)

        await browser.close()

asyncio.run(run())
