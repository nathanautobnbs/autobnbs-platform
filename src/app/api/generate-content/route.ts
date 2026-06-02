import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_CONFIG, TONE_CONFIG } from '@/lib/config';
import { Platform, ToneOfVoice, GeneratedContent } from '@/types';

interface GenerateRequest {
  businessName: string;
  contentPillars: string[];
  tone: ToneOfVoice;
  platforms: Platform[];
  numberOfPosts: number;
}

// Full platform-specific rules injected directly into the prompt
const PLATFORM_RULES: Record<Platform, string> = {
  instagram: `
INSTAGRAM POST RULES — follow every rule exactly:
• Tone: Conversational, visual storytelling, aspirational
• Hook: First line must stop the scroll — punchy, emotional, or surprising (under 10 words)
• Length: 150–300 words for the caption body
• Format: Use line breaks and spacing after every 1–2 sentences for readability
• Emojis: Use naturally throughout — 5 to 10 total
• Hashtags: 20–30 hashtags at the very end, mix of high-volume (#AirbnbHost, #PassiveIncome) and niche (#STRManagementNZ, #AirbnbManagementAustralia)
• CTA: End with one of: "Link in bio 🔗", "DM us PASSIVE 💬", or "Save this post 📌"
• Platform field: MUST be "instagram"`,

  facebook: `
FACEBOOK POST RULES — follow every rule exactly:
• Tone: Conversational, educational, community-focused — more relaxed than LinkedIn, less visual than Instagram
• Length: 100–500 words — longer form storytelling works well here
• Hook: Start with a relatable question or a surprising fact (not a generic "Did you know?")
• Format: Short paragraphs, use bullet points or numbered lists where helpful
• Emojis: Sparingly — maximum 3 to 5 total, not at every line
• Hashtags: 0 to 5 hashtags maximum — Facebook hashtags do not perform well, fewer is better
• Engagement: End with an open question to drive comments — "Comment below", "Tag a property owner you know", or "Share this with someone who needs it"
• CTA: Focus on comments and shares, NOT "link in bio"
• Platform field: MUST be "facebook"`,

  tiktok: `
TIKTOK POST RULES — follow every rule exactly:
• Tone: High energy, direct, trend-aware — written to be SPOKEN OUT LOUD to camera
• Hook: First line must be under 10 words and immediately attention-grabbing — no slow build-ups
• Length: 100–150 words MAXIMUM — short is critical for TikTok
• Format: Script style — written as spoken sentences, not formal writing. Short punchy sentences.
• Emojis: 3 to 6 total, energetic and relevant
• Hashtags: 5–10 hashtags — MUST include #fyp #foryou #foryoupage plus 3 to 5 niche tags
• Ending: Close with a strong hook to follow the account or watch again — "Follow for more" or "Part 2 coming"
• Platform field: MUST be "tiktok"`,

  linkedin: `
LINKEDIN POST RULES — follow every rule exactly:
• Tone: Professional, thought leadership, data-driven — authoritative but not dry
• Opening: Start with a BOLD STATEMENT or surprising insight — NOT a question, NOT an emoji hook
• Length: 150–400 words
• Format: Short paragraphs (2–3 sentences max each), clear line breaks between paragraphs
• Emojis: None, or maximum 1 to 2 professional ones (✅ → is acceptable)
• Focus: Business value, ROI, professional outcomes, market data and insights
• Hashtags: 3–5 professional hashtags at the very end — e.g. #PropertyManagement #PassiveIncome #RealEstateInvesting
• CTA: End with a professional invitation — "What's your experience?", "Connect with us", or "Follow AutoBNBs for more property insights"
• Platform field: MUST be "linkedin"`,

  buffer: `
BUFFER POST RULES:
• Write a versatile post suitable for scheduling across platforms
• Medium length: 100–200 words
• Moderate emoji use
• 5–10 hashtags
• Platform field: MUST be "buffer"`,
};

function buildPlatformSpecificPrompt(
  businessName: string,
  pillarsText: string,
  toneDescription: string,
  postAssignments: Array<{ platform: Platform; pillar: string }>,
): string {
  const neededPlatforms = Array.from(new Set(postAssignments.map((a) => a.platform)));

  const assignmentList = postAssignments
    .map(
      (a, i) =>
        `Post ${i + 1}: PLATFORM=${a.platform.toUpperCase()} | pillar=${a.pillar}`,
    )
    .join('\n');

  const rulesSection = neededPlatforms
    .map((p) => PLATFORM_RULES[p])
    .join('\n\n');

  return `Generate exactly ${postAssignments.length} social media posts for ${businessName}, a short-term rental property management company (clients earn 34% more than self-managed properties via automated Airbnb management).

Overall tone: ${toneDescription}

PLATFORM ASSIGNMENTS — write each post ONLY for its assigned platform:
${assignmentList}

PLATFORM RULES:
${rulesSection}

CONTENT PILLARS: ${pillarsText}

OUTPUT RULES:
- Your response is a raw JSON array that begins with the character [ and ends with ]
- No preamble, no explanation, no markdown fences — pure JSON only
- Each element has exactly these fields:
  id (string), platform (lowercase string matching assignment), caption (string),
  hashtags (array of strings), imageDescription (string), contentPillar (string), approved (false)
- The "platform" field MUST match the assigned platform exactly (e.g. "facebook" not "instagram")`;
}

// Multi-strategy JSON parser: handles clean arrays, truncated arrays, and code fences
function parseJsonArray(raw: string): GeneratedContent[] {
  // Strategy 1: direct parse (fastest, covers most cases)
  try {
    const r = JSON.parse(raw);
    if (Array.isArray(r)) return r;
  } catch { /* fall through */ }

  // Strategy 2: strip any trailing non-JSON text after last closing brace
  const lastBrace = raw.lastIndexOf('}');
  if (lastBrace > 0) {
    try {
      const closed = raw.substring(0, lastBrace + 1) + ']';
      const r = JSON.parse(closed);
      if (Array.isArray(r)) return r;
    } catch { /* fall through */ }
  }

  // Strategy 3: strip markdown fences then extract [...]
  const stripped = raw
    .replace(/^[\s\S]*?```(?:json)?\s*/i, '')
    .replace(/```[\s\S]*$/i, '')
    .trim();
  const match = (stripped.startsWith('[') ? stripped : raw).match(/\[[\s\S]*\]/);
  if (match) {
    const r = JSON.parse(match[0]);
    if (Array.isArray(r)) return r;
  }

  throw new Error('No parseable JSON array found');
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();
    const { businessName, contentPillars, tone, platforms, numberOfPosts } = body;

    if (!businessName || !contentPillars.length || !platforms.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ content: generateDemoContent(platforms, numberOfPosts, tone) });
    }

    const client = new Anthropic({ apiKey });
    const toneDescription = TONE_CONFIG[tone]?.description ?? tone;
    const pillarsText = contentPillars.join(', ');

    // Build explicit platform assignment for each post slot
    const postAssignments = Array.from({ length: numberOfPosts }, (_, i) => ({
      platform: platforms[i % platforms.length],
      pillar: contentPillars[i % contentPillars.length],
    }));

    const userPrompt = buildPlatformSpecificPrompt(
      businessName,
      pillarsText,
      toneDescription,
      postAssignments,
    );

    const message = await client.messages.create({
      model: CLAUDE_CONFIG.model,
      max_tokens: CLAUDE_CONFIG.maxTokens,
      system: `You are an expert social media content writer specialising in short-term rental property management. You write platform-native content tailored precisely to each platform's style. IMPORTANT: You respond with a raw JSON array only — your entire response must be valid JSON starting with [ and ending with ]. Never add any text, explanation, or markdown before or after the JSON.`,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    let content: GeneratedContent[] = [];
    try {
      content = parseJsonArray(responseText);
      if (!Array.isArray(content) || content.length === 0)
        throw new Error('Empty or invalid array');

      // Enforce correct platform values regardless of Claude drift
      content = content.map((post, i) => ({
        ...post,
        platform: postAssignments[i]?.platform ?? post.platform,
      }));
    } catch {
      console.error('Failed to parse Claude response. Raw text (first 1000 chars):', responseText.slice(0, 1000));
      return NextResponse.json(
        { error: 'Failed to parse generated content' },
        { status: 500 }
      );
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { error: 'Content generation failed. Please check your API key and try again.' },
      { status: 500 }
    );
  }
}

function generateDemoContent(
  platforms: Platform[],
  count: number,
  tone: ToneOfVoice,
): GeneratedContent[] {
  const demos: Record<Platform, Omit<GeneratedContent, 'id'>> = {
    instagram: {
      platform: 'instagram',
      caption:
        '🏡 Your property should earn money while you sleep.\n\nAt AutoBNBs, we turn your investment into a fully automated passive income machine — professional guest management, dynamic pricing, and 24/7 support.\n\nOur clients earn 34% more than self-managed listings on average.\n\nReady to stop managing and start earning? 👇\n\nDM us PASSIVE or tap the link in bio.',
      hashtags: [
        '#PassiveIncome', '#AirbnbHost', '#ShortTermRental', '#PropertyManagement',
        '#AutoBNBs', '#RealEstateInvesting', '#AirbnbTips', '#PropertyOwner',
        '#HostLife', '#STR', '#AirbnbBusiness', '#PassiveIncomeGoals',
        '#InvestmentProperty', '#AirbnbManagement', '#RentalIncome',
      ],
      imageDescription: 'Luxurious Airbnb living room with floor-to-ceiling windows at golden hour, immaculate styling',
      contentPillar: 'passive-income',
      approved: false,
    },
    facebook: {
      platform: 'facebook',
      caption:
        'The average self-managed Airbnb leaves $8,000+ on the table every single year.\n\nThat gap exists because managing a short-term rental properly is essentially a second job — dynamic pricing, guest communication, cleaning coordination, maintenance, reviews.\n\nAt AutoBNBs, we handle all of that for you.\n\nThe result? Our clients average 94% occupancy during peak season and 4.92/5 guest ratings — without lifting a finger.\n\nIf you own a property and you\'re doing this yourself, we\'d love to show you what\'s possible.\n\nComment below with your location and we\'ll do a free revenue estimate for your property. 👇',
      hashtags: ['#AirbnbManagement', '#PropertyInvestment', '#AutoBNBs', '#PassiveIncome'],
      imageDescription: 'Property owner relaxing at home while AutoBNBs dashboard shows positive revenue on laptop',
      contentPillar: 'market-insights',
      approved: false,
    },
    tiktok: {
      platform: 'tiktok',
      caption:
        'POV: Your Airbnb just made money while you slept 😴💸\n\nNo late-night guest calls.\nNo chasing cleaners.\nNo pricing stress.\n\nJust passive income — automatically.\n\nThat\'s what AutoBNBs does for property owners.\n\nWe manage everything. You collect the income.\n\nFollow for more STR tips 👇',
      hashtags: ['#fyp', '#foryou', '#foryoupage', '#AirbnbHost', '#PassiveIncome', '#STR', '#AutoBNBs', '#RealEstate'],
      imageDescription: 'Split screen: person sleeping peacefully / Airbnb dashboard showing active bookings and earnings',
      contentPillar: 'passive-income',
      approved: false,
    },
    linkedin: {
      platform: 'linkedin',
      caption:
        'Short-term rental management has a systems problem — and most property owners are paying for it.\n\nAfter analysing 500+ properties under management at AutoBNBs, three variables consistently determine STR revenue performance:\n\n1. Dynamic pricing — Updated daily based on local demand and competition. Static rates cost hosts an average of 22% in potential revenue annually.\n\n2. Response velocity — Properties with sub-1-hour guest response times see 40% more bookings. Automated systems make this scalable.\n\n3. Review consistency — Listings maintaining 4.8+ ratings command 15–25% premium pricing year-round.\n\nNone of these are secrets. They\'re systems. And systems are what most self-managing property owners don\'t have time to build.\n\nWhat\'s your biggest operational challenge with short-term rentals?\n\n#PropertyManagement #ShortTermRental #RealEstateInvesting #PassiveIncome',
      hashtags: ['#PropertyManagement', '#ShortTermRental', '#RealEstateInvesting', '#PassiveIncome'],
      imageDescription: 'Clean data dashboard showing STR performance metrics with upward trending revenue graph',
      contentPillar: 'market-insights',
      approved: false,
    },
    buffer: {
      platform: 'buffer',
      caption: 'AutoBNBs handles everything your Airbnb needs — so you earn more without lifting a finger.',
      hashtags: ['#AutoBNBs', '#PassiveIncome', '#AirbnbHost'],
      imageDescription: 'Modern property with AutoBNBs branding',
      contentPillar: 'passive-income',
      approved: false,
    },
  };

  return Array.from({ length: count }, (_, i) => {
    const platform = platforms[i % platforms.length];
    return {
      ...demos[platform],
      id: `gen-${Date.now()}-${i}`,
      platform,
    };
  });
}
