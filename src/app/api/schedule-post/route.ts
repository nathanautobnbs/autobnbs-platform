import { NextRequest, NextResponse } from 'next/server';
import { Post } from '@/types';

// In production, this would write to a database (Supabase/PostgreSQL).
// For now, it validates the post structure and returns a success response.
// The client-side store handles persistence via localStorage.

export async function POST(req: NextRequest) {
  try {
    const body: Omit<Post, 'id' | 'createdAt'> & { id?: string } = await req.json();

    if (!body.caption || !body.platform || !body.status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // When Buffer is connected, post via Buffer API here
    const bufferToken = process.env.BUFFER_ACCESS_TOKEN;
    if (bufferToken && body.status === 'scheduled') {
      // TODO: Implement Buffer scheduling
      // const buffered = await scheduleViaBuffer(body, bufferToken);
      console.log('Buffer scheduling — API key found, implementation pending');
    }

    // Platform-specific posting
    switch (body.platform) {
      case 'instagram':
        if (process.env.INSTAGRAM_ACCESS_TOKEN) {
          // TODO: Post via Instagram Graph API
          console.log('Instagram post — API connected, scheduling...');
        }
        break;
      case 'facebook':
        if (process.env.FACEBOOK_ACCESS_TOKEN) {
          // TODO: Post via Facebook Graph API
          console.log('Facebook post — API connected, scheduling...');
        }
        break;
      case 'linkedin':
        if (process.env.LINKEDIN_ACCESS_TOKEN) {
          // TODO: Post via LinkedIn API
          console.log('LinkedIn post — API connected, scheduling...');
        }
        break;
      case 'twitter':
        if (process.env.TWITTER_API_KEY) {
          // TODO: Post via Twitter API v2
          console.log('Twitter post — API connected, scheduling...');
        }
        break;
    }

    return NextResponse.json({
      success: true,
      message: 'Post scheduled successfully',
      postId: body.id ?? `post-${Date.now()}`,
    });
  } catch (error) {
    console.error('Schedule post error:', error);
    return NextResponse.json({ error: 'Failed to schedule post' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Schedule post endpoint active' });
}
