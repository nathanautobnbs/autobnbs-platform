import { chromium } from './node_modules/playwright/index.mjs';
import { writeFileSync } from 'fs';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });

// Listen for network requests
const requests = [];
page.on('request', req => {
  if (req.url().includes('unsplash')) {
    requests.push({ url: req.url(), method: req.method() });
  }
});
page.on('response', res => {
  if (res.url().includes('unsplash')) {
    console.log('Unsplash response:', res.status(), res.url().slice(0, 100));
  }
});

console.log('Navigating...');
await page.goto('http://localhost:3004/image-library', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(3000);

console.log('Unsplash requests:', JSON.stringify(requests, null, 2));

// Try clicking a category pill to trigger a search
await page.click('text=Property').catch(() => console.log('No Property button'));
await page.waitForTimeout(3000);

const screenshot = await page.screenshot({ fullPage: true });
writeFileSync('/tmp/image-library-after-click.png', screenshot);

const imgCount = await page.$$eval('img', imgs => imgs.length);
console.log('Images after click:', imgCount);

const bodySlice = await page.evaluate(() => document.body.innerText.slice(0, 1500));
console.log('Body text after click:\n', bodySlice);

await browser.close();
