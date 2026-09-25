import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        await page.goto('http://localhost:5173/?dev=1')
        await page.wait_for_selector('button:has-text("Reveal")')

        # Go straight to Reveal
        await page.click('button:has-text("Reveal")')
        await page.wait_for_timeout(500)

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
        print("FPS when navigating directly to Reveal:", fps_log)

        await browser.close()

asyncio.run(run())
