import { chromium } from './node_modules/playwright/index.mjs';
import { writeFileSync } from 'fs';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

// Sample generated content to inject
const sampleContent = [
  {
    id: 'ig-1',
    platform: 'instagram',
    caption: "Your property is sitting on a goldmine. Are you actually cashing in? 💰\n\nMost property owners leave thousands on the table every single year — not because their property isn't great, but because managing it alone is exhausting.\n\nImagine instead:\n✨ Waking up to booking notifications while you slept\n✨ Guests checked in seamlessly — without a single message from you\n✨ Your calendar optimised for peak pricing, automatically\n✨ Earning 34% MORE than if you managed it yourself\n\nThat's not a dream. That's what AutoBNBs clients experience every month.\n\n👇 Drop \"INFO\" in the comments to find out how much your property could really be earning.",
    hashtags: ['#PassiveIncome','#AirbnbHost','#ShortTermRental','#AutoBNBs','#AirbnbManagement','#PropertyInvestment','#RentalIncome','#AirbnbTips','#FinancialFreedom','#EarnWhileYouSleep'],
    imageDescription: 'A bright, sun-drenched modern bedroom in a beautifully styled Airbnb property — crisp white linen, golden morning light, and a phone showing a booking notification in the foreground.',
    contentPillar: 'passive-income',
    approved: false,
    scheduledFor: null,
  },
  {
    id: 'fb-1',
    platform: 'facebook',
    caption: "What would an extra $2,000/month do for your life? 🏡\n\nThat's exactly what our average AutoBNBs host earns from a single property they already own.\n\nWe take care of everything:\n→ Professional photography & listing optimisation\n→ Dynamic pricing that maximises every booking\n→ Guest communication 24/7\n→ Cleaning & maintenance coordination\n\nYou just collect the income.\n\nReady to find out what your property could earn? Book your free property assessment today.",
    hashtags: ['#AirbnbManagement','#PassiveIncome','#ShortTermRental','#PropertyInvestment','#VacationRental'],
    imageDescription: 'A cozy, modern living room with a large window overlooking a scenic view. Warm lighting, styled with tasteful furniture suggesting a premium Airbnb property.',
    contentPillar: 'passive-income',
    approved: false,
    scheduledFor: null,
  },
  {
    id: 'ig-2',
    platform: 'instagram',
    caption: "5 Airbnb hosting mistakes that are costing you bookings 👇\n\n1️⃣ Poor quality photos — guests scroll fast, make yours stop the scroll\n2️⃣ Static pricing — peak rates leave money on the table off-season\n3️⃣ Slow response times — Airbnb rewards quick replies with more visibility\n4️⃣ Generic descriptions — tell a story, not a spec list\n5️⃣ Ignoring reviews — your responses show future guests who you are\n\nFix these 5 things and watch your occupancy rate climb. Save this post! 📌",
    hashtags: ['#AirbnbTips','#AirbnbHost','#ShortTermRental','#AirbnbHosting','#VacationRental','#AirbnbSuperhost'],
    imageDescription: 'A beautifully arranged flat-lay of hosting essentials: a key card, small succulents, welcome note cards, local guidebook, and artisan coffee pods on a white marble surface.',
    contentPillar: 'airbnb-tips',
    approved: true,
    scheduledFor: null,
  },
];

const stateToSet = JSON.stringify({ generatedContent: sampleContent });

await page.goto('http://localhost:3004/content-generator', { waitUntil: 'networkidle', timeout: 30000 });

// Inject content into localStorage
await page.evaluate((state) => {
  const existing = JSON.parse(localStorage.getItem('autobnbs-state') || '{}');
  existing.generatedContent = JSON.parse(state).generatedContent;
  localStorage.setItem('autobnbs-state', JSON.stringify(existing));
}, stateToSet);

await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

const screenshot = await page.screenshot({ path: '/tmp/content-cards.png', fullPage: true });
console.log('Cards screenshot saved');

await browser.close();
