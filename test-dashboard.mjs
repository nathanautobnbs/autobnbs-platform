import { chromium } from './node_modules/playwright/index.mjs';
import { writeFileSync } from 'fs';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

await page.goto('http://localhost:3004', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);

const screenshot = await page.screenshot({ path: '/tmp/dashboard.png', fullPage: true });
console.log('Done');
await browser.close();
