import { AdLayout, AdSize } from '@/types';

export interface AdConfig {
  imageUrl: string;   // original image URL (not proxied — server fetches directly)
  headline: string;
  subtext: string;
  layout: AdLayout;
  size: AdSize;
  logoUrl?: string;   // unused — branding is baked into the server template
}

/**
 * Generates a professional ad image by calling the server-side /api/generate-design
 * endpoint, which renders a Satori/next-og JSX template to PNG.
 * Returns a blob object URL suitable for <img> src and download.
 */
export async function generateAdDataUrl(config: AdConfig): Promise<string> {
  const res = await fetch('/api/generate-design', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      headline: config.headline,
      subtext: config.subtext,
      imageUrl: config.imageUrl,
      layout: config.layout,
      size: config.size,
    }),
  });

  if (!res.ok) throw new Error(`Design generation failed: ${res.status}`);

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
