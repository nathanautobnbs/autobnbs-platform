import { chromium } from './node_modules/playwright/index.mjs';
import { writeFileSync } from 'fs';

const PORT = 3002;
const browser = await chromium.launch({ headless: true });

// Settings account screenshot
const p1 = await browser.newPage();
await p1.setViewportSize({ width: 1280, height: 900 });
await p1.goto(`http://localhost:${PORT}/settings`, { waitUntil: 'networkidle' });
await p1.click('text=Account');
await p1.waitForTimeout(600);
writeFileSync('/tmp/settings-account.png', await p1.screenshot({ fullPage: false }));
await p1.close();

// Content generator with injected content
const p2 = await browser.newPage();
await p2.setViewportSize({ width: 1440, height: 900 });
await p2.goto(`http://localhost:${PORT}/content-generator`, { waitUntil: 'networkidle' });
await p2.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('autobnbs-state') || '{}');
  s.generatedContent = [{
    id: 'demo-1', platform: 'instagram',
    caption: "Stop leaving money on the table.\n\nYour property could earn 40% more with professional management.\n\nAutoBNBs handles everything so you earn more, stress less.\n\n#PassiveIncome #AirbnbHost #AutoBNBs",
    hashtags: ['#PassiveIncome','#AirbnbHost','#AutoBNBs','#ShortTermRental'],
    imageDescription: 'Luxury bedroom', contentPillar: 'passive-income', approved: false
  }];
  localStorage.setItem('autobnbs-state', JSON.stringify(s));
});
await p2.reload({ waitUntil: 'networkidle' });
await p2.waitForTimeout(1000);
writeFileSync('/tmp/content-gen-fixed.png', await p2.screenshot({ fullPage: true }));
await p2.close();

await browser.close();
console.log('Screenshots saved');
