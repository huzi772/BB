import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        # Mobile viewport
        context = await browser.new_context(
            viewport={'width': 375, 'height': 812},
            is_mobile=True,
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
        )
        page = await context.new_page()

        await page.goto('http://localhost:5173/?dev=1')
        await page.wait_for_selector('button:has-text("Cake")')

        await page.click('button:has-text("Cake")')
        await page.wait_for_timeout(4500)

        await page.click('button:has-text("BLOW THE CANDLES")')

        # Monitor frame times on mobile during BirthdayReveal
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

                    // Monitor between blow finish (2.5s) and reveal animation (6.5s)
                    if (elapsed >= 2000 && elapsed <= 7000) {
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
        print(f"Mobile - Total recorded frames in window: {len(frames_data)}")
        print(f"Mobile - Slow frames (>20ms): {len(slow_frames)}")
        for f in slow_frames:
            print(f"  Mobile slow frame at {f['time']}ms: {f['delta']}ms ({int(1000/f['delta'])} fps)")

        await browser.close()

asyncio.run(run())
