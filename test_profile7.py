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
                    let h2 = document.querySelector('h2');
                    timeline.push({
                        time: Math.round(now - start),
                        dt: Math.round(dt),
                        canvases: canvases,
                        h2Text: h2 ? h2.innerText : ''
                    });

                    if (now - start < 10000) {
                        requestAnimationFrame(sample);
                    } else {
                        resolve(timeline);
                    }
                }
                requestAnimationFrame(sample);
            })
        """)

        for pt in fps_timeline:
            if pt['time'] % 500 < 20 or pt['dt'] > 25:
                print(f"Time: {pt['time']}ms | Frame dt: {pt['dt']}ms (FPS: {int(1000/max(1, pt['dt']))}) | Canvases: {pt['canvases']} | Title: {pt['h2Text']}")

        await browser.close()

asyncio.run(run())
