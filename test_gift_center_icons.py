import { test, expect } from '@playwright/test';

test('capture gift center desktop and mobile icons', async ({ page }) => {
  // Desktop view
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/?dev=1');
  await page.waitForSelector('text=DEV:');
  await page.click('button:has-text("Gifts")');
  await page.waitForSelector('text=A Few Things For You');
  await page.screenshot({ path: '/home/jules/verification/gift_center_icons_desktop.png' });

  // Mobile view
  await page.setViewportSize({ width: 375, height: 667 });
  await page.screenshot({ path: '/home/jules/verification/gift_center_icons_mobile.png' });
});
