import { chromium } from './node_modules/playwright/index.mjs';
import { writeFileSync } from 'fs';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

await page.goto('http://localhost:3004/content-generator', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1000);

// Click Generate Content
console.log('Clicking Generate Content...');
await page.click('text=Generate Content');

// Wait for API response (up to 40s)
await page.waitForFunction(() => {
  const body = document.body.innerText;
  return body.includes('Instagram') && body.includes('#') || body.includes('Generating');
}, { timeout: 40000 }).catch(() => console.log('Timeout waiting for response'));

await page.waitForTimeout(3000);
const screenshot = await page.screenshot({ path: '/tmp/content-gen-results.png', fullPage: true });
console.log('Results screenshot saved');

await browser.close();
