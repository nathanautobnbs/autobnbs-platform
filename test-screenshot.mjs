import { chromium } from './node_modules/playwright/index.mjs';
import { writeFileSync } from 'fs';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

await page.goto('http://localhost:3004/image-library', { waitUntil: 'networkidle', timeout: 30000 });

// Click "Property" category to load images
await page.click('text=Property');
await page.waitForTimeout(4000);

const screenshot = await page.screenshot({ path: '/tmp/image-library-final.png', fullPage: true });
console.log('Screenshot saved');

// Also test the search bar
await page.fill('input[placeholder*="Search"]', 'swimming pool');
await page.waitForTimeout(3000);
const screenshot2 = await page.screenshot({ path: '/tmp/image-library-search.png', fullPage: false });
console.log('Search screenshot saved');

await browser.close();
