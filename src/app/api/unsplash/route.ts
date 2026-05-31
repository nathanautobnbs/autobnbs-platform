import { NextRequest, NextResponse } from 'next/server';
import { UnsplashImage } from '@/types';

const UNSPLASH_BASE = 'https://api.unsplash.com';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') ?? 'airbnb property';
  const page = searchParams.get('page') ?? '1';
  const perPage = searchParams.get('per_page') ?? '20';

  // NEXT_PUBLIC_ vars are available server-side too; fall back to the non-public name
  const accessKey =
    process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY ?? process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    // Return placeholder images when no key is set
    return NextResponse.json({ images: generatePlaceholderImages(query, parseInt(perPage)) });
  }

  try {
    const url = `${UNSPLASH_BASE}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape&content_filter=high`;

    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}` },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`Unsplash API error: ${res.status}`);
    }

    const data = await res.json();

    const images: UnsplashImage[] = data.results.map((photo: any) => ({
      id: photo.id,
      url: photo.urls.regular,
      thumbUrl: photo.urls.small,
      description: photo.description ?? photo.alt_description ?? 'Unsplash photo',
      authorName: photo.user.name,
      authorUrl: `https://unsplash.com/@${photo.user.username}?utm_source=autobnbs&utm_medium=referral`,
      downloadUrl: photo.links.download_location,
      width: photo.width,
      height: photo.height,
    }));

    return NextResponse.json({ images, total: data.total });
  } catch (error) {
    console.error('Unsplash API error:', error);
    return NextResponse.json(
      { images: generatePlaceholderImages(query, parseInt(perPage)) },
      { status: 200 }
    );
  }
}

function generatePlaceholderImages(query: string, count: number): UnsplashImage[] {
  const seeds = [
    'property', 'airbnb', 'rental', 'home', 'interior', 'luxury',
    'travel', 'lifestyle', 'business', 'success', 'income', 'invest',
    'bedroom', 'kitchen', 'living', 'pool', 'garden', 'terrace',
    'city', 'coast',
  ];

  return Array.from({ length: count }, (_, i) => {
    const seed = seeds[i % seeds.length];
    return {
      id: `placeholder-${i}-${seed}`,
      url: `https://picsum.photos/seed/${seed}${i}/800/600`,
      thumbUrl: `https://picsum.photos/seed/${seed}${i}/400/300`,
      description: `${query} — professional photo ${i + 1}`,
      authorName: 'Demo Image',
      authorUrl: 'https://picsum.photos',
      downloadUrl: `https://picsum.photos/seed/${seed}${i}/800/600`,
      width: 800,
      height: 600,
    };
  });
}
