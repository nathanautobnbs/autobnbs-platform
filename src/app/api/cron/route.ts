import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_CONFIG, PLATFORM_CONFIG } from '@/lib/config';

// Vercel Cron Job endpoint — runs daily at 8am UTC
// Configured in vercel.json: { "crons": [{ "path": "/api/cron/generate-daily", "schedule": "0 8 * * *" }] }
// Requires CRON_SECRET env variable to prevent unauthorized access

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'No Claude API key configured' }, { status: 500 });
  }

  try {
    const client = new Anthropic({ apiKey });

    // Generate daily content for all platforms
    const platforms = ['instagram', 'facebook', 'tiktok', 'linkedin'];
    const message = await client.messages.create({
      model: CLAUDE_CONFIG.model,
      max_tokens: 2048,
      system: CLAUDE_CONFIG.systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Generate 4 social media posts for AutoBNBs (short-term rental management) — one for each platform: Instagram, Facebook, TikTok, LinkedIn.

Return a JSON array with the same structure as always. Keep content fresh and varied from yesterday's posts. Focus on our core message: property owners earning passive income through professional Airbnb management.`,
        },
      ],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '[]';

    let content = [];
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      content = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      console.error('Failed to parse cron generation response');
    }

    // In production, save these to database and schedule them
    console.log(`Daily cron: Generated ${content.length} posts for AutoBNBs`);

    return NextResponse.json({
      success: true,
      generated: content.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron generation error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
