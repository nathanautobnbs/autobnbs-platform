import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_CONFIG, PLATFORM_CONFIG, TONE_CONFIG } from '@/lib/config';
import { Platform, ToneOfVoice, GeneratedContent } from '@/types';

interface GenerateRequest {
  businessName: string;
  contentPillars: string[];
  tone: ToneOfVoice;
  platforms: Platform[];
  numberOfPosts: number;
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
      // Return demo content when no API key is set
      return NextResponse.json({ content: generateDemoContent(platforms, numberOfPosts, tone) });
    }

    const client = new Anthropic({ apiKey });

    const platformDescriptions = platforms
      .map(
        (p) =>
          `${PLATFORM_CONFIG[p].label}: ${PLATFORM_CONFIG[p].tone} Max characters: ${PLATFORM_CONFIG[p].maxCaptionLength}. Max hashtags: ${PLATFORM_CONFIG[p].maxHashtags}.`
      )
      .join('\n');

    const toneDescription = TONE_CONFIG[tone]?.description ?? tone;
    const pillarsText = contentPillars.join(', ');

    const userPrompt = `Generate ${numberOfPosts} unique social media posts for ${businessName}, a short-term rental property management company.

Business context: ${businessName} helps property owners earn passive income through automated Airbnb management. Clients earn an average of 34% more than self-managed properties.

Content pillars to draw from: ${pillarsText}

Tone of voice: ${tone} — ${toneDescription}

Generate posts optimised for these platforms:
${platformDescriptions}

For each post, return a JSON object with this exact structure:
{
  "id": "unique-id",
  "platform": "platform-name",
  "caption": "The full caption ready to post",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "imageDescription": "Description of the ideal image for this post",
  "contentPillar": "the-content-pillar-used",
  "approved": false
}

Return a JSON array of ${numberOfPosts} posts. Distribute posts across the requested platforms.

Rules:
- ALWAYS start the caption with a strong hook that stops the scroll
- Instagram captions can be longer (up to 300 words), use line breaks, emojis, and a strong CTA
- LinkedIn captions are professional, insight-driven, data-backed, 150-250 words
- Facebook captions are conversational, community-focused, 100-200 words
- Twitter captions are under 250 characters, punchy and direct
- Vary the content pillars across posts — don't repeat the same topic
- Every post must mention or reference ${businessName} naturally
- Hashtags should be a mix of high-volume (#AirbnbHost) and niche (#AirbnbManagementAustralia)
- Image descriptions should be specific and visually evocative

Return ONLY the JSON array. No other text.`;

    const message = await client.messages.create({
      model: CLAUDE_CONFIG.model,
      max_tokens: CLAUDE_CONFIG.maxTokens,
      system: CLAUDE_CONFIG.systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse the JSON response
    let content: GeneratedContent[] = [];
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        content = JSON.parse(jsonMatch[0]);
      } else {
        content = JSON.parse(responseText);
      }
    } catch {
      console.error('Failed to parse Claude response:', responseText);
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
  tone: ToneOfVoice
): GeneratedContent[] {
  const demoPosts: Omit<GeneratedContent, 'id'>[] = [
    {
      platform: 'instagram',
      caption:
        '🏡 Your property should work as hard as you do — even when you\'re not.\n\nAt AutoBNBs, we\'ve built a system that turns your investment property into a fully automated, passive income machine. Professional guest management. Dynamic pricing. 24/7 support.\n\nOur clients don\'t manage their Airbnbs. We do.\n\nAnd the results speak for themselves — 34% higher revenue on average vs self-managed properties.\n\nReady to stop managing and start earning? Drop \'INFO\' in the comments or tap the link in bio.\n\n🔗 autobnbs.com',
      hashtags: [
        '#PassiveIncome', '#AirbnbHost', '#ShortTermRental', '#PropertyManagement',
        '#AutoBNBs', '#RealEstateInvesting', '#AirbnbTips', '#PropertyOwner',
        '#HostLife', '#STR', '#AirbnbBusiness', '#PassiveIncomeGoals',
      ],
      imageDescription: 'Luxurious Airbnb living room with floor-to-ceiling windows at golden hour, immaculate styling',
      contentPillar: 'passive-income',
      approved: false,
    },
    {
      platform: 'facebook',
      caption:
        'Did you know the average self-managed Airbnb leaves $8,000+ per year on the table?\n\nThat\'s the gap between what most property owners earn and what their property COULD be earning with professional management.\n\nAt AutoBNBs, we close that gap for our clients:\n✅ Dynamic pricing updated daily\n✅ Professional listing photography\n✅ 24/7 guest communication\n✅ Maintenance coordination\n✅ Monthly revenue reporting\n\nThe result? Our clients average 94% occupancy during peak season and 4.92/5 guest ratings.\n\nCurious what your property could earn? Comment below and we\'ll do a free revenue estimate for you.',
      hashtags: [
        '#AirbnbManagement', '#PropertyInvestment', '#AutoBNBs', '#PassiveIncome',
        '#ShortTermRental', '#RealEstate',
      ],
      imageDescription: 'Professional property manager reviewing analytics dashboard with positive revenue graphs',
      contentPillar: 'market-insights',
      approved: false,
    },
    {
      platform: 'linkedin',
      caption:
        'The short-term rental market grew 18% last year. Here\'s what separates the top performers:\n\nAfter analysing 500+ properties under management at AutoBNBs, three variables consistently predict STR success:\n\n1. Dynamic pricing — Updated daily based on local demand, events, and competition. Static rates cost hosts an average 22% in potential revenue.\n\n2. Response velocity — Properties with sub-1-hour response times see 40% more bookings. Automated messaging systems make this scalable.\n\n3. Review consistency — Properties maintaining 4.8+ ratings command 15-25% premium pricing year-round.\n\nThese aren\'t secrets. They\'re systems. And systems are what AutoBNBs provides for property owners who want results without the operational burden.\n\nWhat\'s your biggest challenge with short-term rental management?',
      hashtags: [
        '#PropertyManagement', '#ShortTermRental', '#RealEstateInvesting', '#AutoBNBs',
        '#PassiveIncome',
      ],
      imageDescription: 'Professional business analytics chart showing STR market growth and performance metrics',
      contentPillar: 'market-insights',
      approved: false,
    },
    {
      platform: 'tiktok',
      caption:
        'Your Airbnb should earn money while you sleep.\n\nMost hosts earn 34% less than they could. AutoBNBs closes that gap — automatically.\n\nFull property management. Zero daily effort. 🏡',
      hashtags: ['#AirbnbHost', '#PassiveIncome', '#AutoBNBs'],
      imageDescription: 'Minimal graphic with property icon and passive income message on clean white background',
      contentPillar: 'passive-income',
      approved: false,
    },
    {
      platform: 'instagram',
      caption:
        'Meet the property that changed everything for James and Lisa. 🏘️\n\nThey bought a 3-bedroom apartment in Brisbane as an investment. For 18 months, they self-managed — fielding guest calls at midnight, scrambling for cleaners, and still making less than their mortgage payments.\n\nThen they discovered AutoBNBs.\n\nIn 6 months:\n→ Revenue increased by 47%\n→ Guest rating went from 4.2 to 4.9\n→ Zero management time required\n→ Occupancy jumped from 68% to 91%\n\n"We wish we\'d done this from day one." — James & Lisa, Brisbane\n\nYour property deserves this. DM us \'PASSIVE\' to find out how we can transform yours.',
      hashtags: [
        '#SuccessStory', '#AirbnbManagement', '#PassiveIncome', '#AutoBNBs',
        '#PropertyOwner', '#RealEstateSuccess', '#AirbnbHost', '#STRInvesting',
        '#PropertyInvestment', '#HostLife',
      ],
      imageDescription: 'Stunning modern Brisbane apartment interior with river views, perfectly styled for Airbnb',
      contentPillar: 'success-stories',
      approved: false,
    },
  ];

  const results: GeneratedContent[] = [];
  const platformCycle = [...platforms];

  for (let i = 0; i < count; i++) {
    const platform = platformCycle[i % platformCycle.length];
    const base = demoPosts.find((p) => p.platform === platform) ?? demoPosts[i % demoPosts.length];
    results.push({
      ...base,
      id: `gen-${Date.now()}-${i}`,
      platform,
    });
  }

  return results;
}
