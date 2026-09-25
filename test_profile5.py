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

        # Record GSAP ticker listeners or RAF count
        info1 = await page.evaluate("""
            () => {
                return {
                    gsapTickerListeners: window.gsap ? gsap.ticker._head : null,
                    activeAudioNodes: window.audioManager ? true : false
                }
            }
        """)
        print("Before blow:", info1)

        await page.click('button:has-text("BLOW THE CANDLES")')
        await page.wait_for_timeout(3500)

        # Now in BirthdayReveal
        # Check what is taking CPU or if there's an ongoing loop or memory leak
        info2 = await page.evaluate("""
            () => {
                let activeElements = document.body.querySelectorAll('*').length;
                return {
                    domElements: activeElements,
                    canvas: document.querySelector('canvas') ? {
                        w: document.querySelector('canvas').width,
                        h: document.querySelector('canvas').height
                    } : null
                }
            }
        """)
        print("After reveal:", info2)

        # Let's test BirthdayReveal FPS WITHOUT Fireworks component or WITHOUT letterSpacing
        await browser.close()

asyncio.run(run())
