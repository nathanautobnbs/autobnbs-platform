import { chromium } from './node_modules/playwright/index.mjs';
import { writeFileSync } from 'fs';

const PORT = 3005;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

// Inject pre-generated content with a visual ad state we'll trigger
const content = [
  {
    id: 'ig-demo-1',
    platform: 'instagram',
    caption: "Your property is sitting on a goldmine.\n\nMost property owners leave thousands on the table every year — not because their property isn't great, but because managing it alone is exhausting.\n\nImagine waking up to booking notifications while you slept.\n\nThat's what AutoBNBs clients experience every month.\n\n#PassiveIncome #AirbnbHost #ShortTermRental",
    hashtags: ['#PassiveIncome','#AirbnbHost','#ShortTermRental','#AutoBNBs'],
    imageDescription: 'Modern luxury bedroom with golden morning light',
    contentPillar: 'passive-income',
    approved: false,
  },
  {
    id: 'fb-demo-1',
    platform: 'facebook',
    caption: "What would an extra 2,000 per month do for your life?\n\nThat's exactly what our average AutoBNBs host earns from a single property they already own.\n\nWe handle everything — you collect the income.\n\n#AirbnbManagement #PassiveIncome",
    hashtags: ['#AirbnbManagement','#PassiveIncome','#ShortTermRental'],
    imageDescription: 'Cozy modern living room with scenic view',
    contentPillar: 'passive-income',
    approved: true,
  },
];

await page.goto(`http://localhost:${PORT}/content-generator`, { waitUntil: 'networkidle', timeout: 30000 });

await page.evaluate((c) => {
  const state = JSON.parse(localStorage.getItem('autobnbs-state') || '{}');
  state.generatedContent = c;
  localStorage.setItem('autobnbs-state', JSON.stringify(state));
}, content);

await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// Screenshot of the form with toggle visible (visual ad mode ON by default)
const s1 = await page.screenshot({ path: '/tmp/visual-ad-page.png', fullPage: false });
console.log('Page screenshot saved');

// Full page
const s2 = await page.screenshot({ path: '/tmp/visual-ad-full.png', fullPage: true });
console.log('Full page screenshot saved');

await browser.close();
