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

        await page.click('button:has-text("BLOW THE CANDLES")')

        # Record timeline of FPS and canvas count over 6 seconds
        fps_timeline = await page.evaluate("""
            new Promise((resolve) => {
                let timeline = [];
                let start = performance.now();
                let lastFrame = performance.now();

                function sample() {
                    let now = performance.now();
                    let dt = now - lastFrame;
                    lastFrame = now;
                    let canvases = document.querySelectorAll('canvas').length;
                    timeline.push({
                        time: Math.round(now - start),
                        dt: Math.round(dt),
                        canvases: canvases
                    });

                    if (now - start < 6000) {
                        requestAnimationFrame(sample);
                    } else {
                        resolve(timeline);
                    }
                }
                requestAnimationFrame(sample);
            })
        """)

        # Print samples around the transition time (~2500ms to 4500ms)
        print("Timeline sample:")
        for pt in fps_timeline:
            if 2000 <= pt['time'] <= 5000 and pt['dt'] > 25: # frames taking longer than 25ms (<40fps)
                print(f"Time: {pt['time']}ms | Frame dt: {pt['dt']}ms | Canvases: {pt['canvases']}")

        await browser.close()

asyncio.run(run())
