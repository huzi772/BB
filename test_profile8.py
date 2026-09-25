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

        # Collect detailed frame timings during BirthdayReveal text animation (between 3.5s and 6.5s)
        frames_data = await page.evaluate("""
            new Promise((resolve) => {
                let frames = [];
                let start = performance.now();
                let last = performance.now();

                function loop() {
                    let now = performance.now();
                    let delta = now - last;
                    last = now;
                    let elapsed = now - start;

                    if (elapsed >= 3500 && elapsed <= 7000) {
                        frames.push({ time: Math.round(elapsed), delta: Math.round(delta) });
                    }

                    if (elapsed < 7000) {
                        requestAnimationFrame(loop);
                    } else {
                        resolve(frames);
                    }
                }
                requestAnimationFrame(loop);
            })
        """)

        slow_frames = [f for f in frames_data if f['delta'] > 20]
        print(f"Total recorded frames in animation window: {len(frames_data)}")
        print(f"Slow frames (>20ms / <50fps): {len(slow_frames)}")
        for f in slow_frames[:15]:
            print(f"  at {f['time']}ms: frame took {f['delta']}ms ({int(1000/f['delta'])} fps)")

        await browser.close()

asyncio.run(run())
