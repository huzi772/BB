import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Desktop view
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/?dev=1');
  await page.waitForSelector('button:has-text("Gifts")');
  await page.click('button:has-text("Gifts")');
  await page.waitForSelector('h2:has-text("A Few Things For You")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/home/jules/verification/gift_center_icons_desktop.png' });

  // Mobile view
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/home/jules/verification/gift_center_icons_mobile.png' });

  await browser.close();
})();
