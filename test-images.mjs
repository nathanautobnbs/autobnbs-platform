import { chromium } from './node_modules/playwright/index.mjs';
import { writeFileSync } from 'fs';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });

console.log('Navigating to image library...');
await page.goto('http://localhost:3004/image-library', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(4000);

const screenshot = await page.screenshot({ fullPage: false });
writeFileSync('/tmp/image-library.png', screenshot);
console.log('Screenshot saved to /tmp/image-library.png');

const bodyText = await page.evaluate(() => document.body.innerText);
console.log('Page text (first 1000 chars):\n', bodyText.slice(0, 1000));

// Check for images
const imgCount = await page.$$eval('img', imgs => imgs.length);
console.log('Image elements on page:', imgCount);

await browser.close();
