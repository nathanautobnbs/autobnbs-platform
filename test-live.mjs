import { chromium } from './node_modules/playwright/index.mjs';
import { writeFileSync } from 'fs';

const BASE = 'https://autobnbs-platform.vercel.app';
const browser = await chromium.launch({ headless: true });

async function shot(path, url, wait = 3000) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 40000 });
  await page.waitForTimeout(wait);
  writeFileSync(path, await page.screenshot({ fullPage: false }));
  await page.close();
  console.log('✓', url);
}

await shot('/tmp/live-dashboard.png', BASE);
await shot('/tmp/live-content-gen.png', `${BASE}/content-generator`);
await shot('/tmp/live-image-library.png', `${BASE}/image-library`, 4000);

await browser.close();
console.log('Done');
