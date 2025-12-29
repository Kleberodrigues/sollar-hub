import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

// Add timestamp to bypass cache
const url = `https://sollar-hub-yurq.vercel.app/blog?t=${Date.now()}`;
console.log('Navigating to:', url);

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// Take full page screenshot
await page.screenshot({
  path: 'blog-screenshot.png',
  fullPage: true
});

console.log('Screenshot saved to blog-screenshot.png');

// Also take viewport screenshot
await page.screenshot({
  path: 'blog-viewport.png'
});

console.log('Viewport screenshot saved to blog-viewport.png');

await browser.close();
