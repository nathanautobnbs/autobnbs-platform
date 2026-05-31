import { chromium } from './node_modules/playwright/index.mjs';
import { writeFileSync } from 'fs';

const PORT = 3002;
const browser = await chromium.launch({ headless: true });

// ── Test 1: Settings Account tab ─────────────────────────────────────────────
{
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`http://localhost:${PORT}/settings`, { waitUntil: 'networkidle' });
  await page.click('text=Account');
  await page.waitForTimeout(500);
  const screenshot = await page.screenshot({ path: '/tmp/settings-account.png', fullPage: false });
  const bodyText = await page.evaluate(() => document.body.innerText);
  const emailValue = await page.$eval('input[type="email"]', el => el.value).catch(() => 'NOT FOUND');
  console.log('Settings Account email value:', emailValue);
  console.log('Has Save button:', bodyText.includes('Save Account'));
  await page.close();
}

// ── Test 2: Ad generator with canvas ─────────────────────────────────────────
{
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  // Verify logo SVG is served
  const logoRes = await page.goto(`http://localhost:${PORT}/logoman.svg`);
  console.log('Logo SVG status:', logoRes?.status());

  // Verify proxy image route works
  const testImgUrl = 'https://images.unsplash.com/photo-1560185127-bc36ce01f6e5?w=400&q=80';
  const proxyRes = await page.goto(`http://localhost:${PORT}/api/proxy-image?url=${encodeURIComponent(testImgUrl)}`);
  console.log('Proxy image status:', proxyRes?.status(), 'content-type:', proxyRes?.headers()['content-type']);

  await page.close();
}

await browser.close();
console.log('All tests done');
