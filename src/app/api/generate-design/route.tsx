import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const W = 1080;

interface TplProps {
  headline: string;
  subtext: string;
  imageUrl: string;
  H: number;
}

// ── Templates ─────────────────────────────────────────────────────────────────

function FullBleed({ headline, subtext, imageUrl, H }: TplProps) {
  return (
    <div
      style={{
        width: W,
        height: H,
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'sans-serif',
        background: '#111827',
      }}
    >
      {/* Background photo — cover fill */}
      <img
        src={imageUrl}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Dark gradient — transparent → rgba(0,0,0,0.75) */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '65%',
          background:
            'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.78) 100%)',
        }}
      />

      {/* AutoBNBs — top right */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          right: 80,
          fontSize: 30,
          fontWeight: 800,
          color: 'rgba(255,255,255,0.92)',
          letterSpacing: '-0.5px',
        }}
      >
        AutoBNBs
      </div>

      {/* Headline + subtext — bottom third */}
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          left: 80,
          right: 80,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.18,
            marginBottom: 18,
          }}
        >
          {headline}
        </div>
        <div
          style={{
            fontSize: 27,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.84)',
            lineHeight: 1.55,
          }}
        >
          {subtext}
        </div>
      </div>

      {/* autobnbs.com — bottom centre */}
      <div
        style={{
          position: 'absolute',
          bottom: 44,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          fontSize: 22,
          color: 'rgba(255,255,255,0.70)',
        }}
      >
        autobnbs.com
      </div>
    </div>
  );
}

function BottomBar({ headline, subtext, imageUrl, H }: TplProps) {
  const split = Math.round(H * 0.58);
  const barH = H - split;

  return (
    <div
      style={{
        width: W,
        height: H,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Photo top section */}
      <div
        style={{
          width: W,
          height: split,
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <img
          src={imageUrl}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        {/* AutoBNBs — top right */}
        <div
          style={{
            position: 'absolute',
            top: 52,
            right: 72,
            fontSize: 28,
            fontWeight: 800,
            color: 'rgba(255,255,255,0.9)',
          }}
        >
          AutoBNBs
        </div>
        {/* Fade at bottom of photo */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '40%',
            background: 'linear-gradient(to bottom, transparent, rgba(13,13,13,0.8))',
          }}
        />
      </div>

      {/* Dark bottom panel */}
      <div
        style={{
          width: W,
          height: barH,
          background: '#0d0d0d',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 80px',
        }}
      >
        {/* 2px separator */}
        <div
          style={{
            position: 'absolute',
            top: split,
            left: 0,
            width: '100%',
            height: 2,
            background: 'rgba(255,255,255,0.1)',
          }}
        />
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.2,
            marginBottom: 16,
          }}
        >
          {headline}
        </div>
        <div
          style={{
            fontSize: 25,
            color: 'rgba(255,255,255,0.80)',
            lineHeight: 1.5,
          }}
        >
          {subtext}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 21,
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          autobnbs.com
        </div>
      </div>
    </div>
  );
}

function LeftAligned({ headline, subtext, imageUrl, H }: TplProps) {
  return (
    <div
      style={{
        width: W,
        height: H,
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'sans-serif',
        background: '#111827',
      }}
    >
      {/* Background photo */}
      <img
        src={imageUrl}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Dark left gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '75%',
          height: '100%',
          background:
            'linear-gradient(to right, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.60) 55%, transparent 100%)',
        }}
      />

      {/* Bottom gradient for watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '15%',
          background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.65))',
        }}
      />

      {/* AutoBNBs — top right */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          right: 80,
          fontSize: 30,
          fontWeight: 800,
          color: 'rgba(255,255,255,0.9)',
        }}
      >
        AutoBNBs
      </div>

      {/* Accent bar */}
      <div
        style={{
          position: 'absolute',
          left: 80,
          top: Math.round(H * 0.60),
          width: 56,
          height: 6,
          background: 'rgba(255,255,255,0.85)',
          borderRadius: 3,
        }}
      />

      {/* Text — lower left */}
      <div
        style={{
          position: 'absolute',
          top: Math.round(H * 0.63),
          left: 80,
          width: Math.round(W * 0.54),
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            fontSize: 68,
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.2,
            marginBottom: 18,
          }}
        >
          {headline}
        </div>
        <div
          style={{
            fontSize: 26,
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.55,
          }}
        >
          {subtext}
        </div>
      </div>

      {/* autobnbs.com — bottom centre */}
      <div
        style={{
          position: 'absolute',
          bottom: 44,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          fontSize: 22,
          color: 'rgba(255,255,255,0.70)',
        }}
      >
        autobnbs.com
      </div>
    </div>
  );
}

function GradientFallback({ headline, subtext, H }: Omit<TplProps, 'imageUrl'>) {
  return (
    <div
      style={{
        width: W,
        height: H,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 80px 100px',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 55%, #0f3460 100%)',
        fontFamily: 'sans-serif',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 60,
          right: 80,
          fontSize: 30,
          fontWeight: 800,
          color: 'rgba(255,255,255,0.9)',
        }}
      >
        AutoBNBs
      </div>
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: '#ffffff',
          lineHeight: 1.2,
          marginBottom: 18,
        }}
      >
        {headline}
      </div>
      <div
        style={{
          fontSize: 27,
          color: 'rgba(255,255,255,0.82)',
          lineHeight: 1.55,
        }}
      >
        {subtext}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 44,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          fontSize: 22,
          color: 'rgba(255,255,255,0.65)',
        }}
      >
        autobnbs.com
      </div>
    </div>
  );
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: { headline?: string; subtext?: string; imageUrl?: string; layout?: string; size?: string } = {};
  try {
    body = await req.json();
    const { headline, subtext, imageUrl, layout, size } = body;

    const H = size === 'story' ? 1920 : 1080;

    // Truncate headline to 6 words, subtext to 18 words
    const h = String(headline ?? '').trim().split(/\s+/).slice(0, 6).join(' ');
    const s = String(subtext ?? '').trim().split(/\s+/).slice(0, 18).join(' ');

    // Pre-validate the image URL before handing to Satori — a mid-render fetch
    // failure crashes the Edge response stream before the catch block fires.
    let resolvedImageUrl: string | null = null;
    if (imageUrl) {
      try {
        const probe = await fetch(imageUrl, { method: 'HEAD' });
        if (probe.ok) resolvedImageUrl = imageUrl;
      } catch {
        resolvedImageUrl = null;
      }
    }

    // Use gradient fallback if image unavailable
    if (!resolvedImageUrl) {
      return new ImageResponse(<GradientFallback headline={h} subtext={s} H={H} />, {
        width: W,
        height: H,
      });
    }

    const props: TplProps = { headline: h, subtext: s, imageUrl: resolvedImageUrl, H };

    let template: JSX.Element;
    if (layout === 'bottom-bar') {
      template = <BottomBar {...props} />;
    } else if (layout === 'left-aligned') {
      template = <LeftAligned {...props} />;
    } else {
      template = <FullBleed {...props} />;
    }

    return new ImageResponse(template, { width: W, height: H });
  } catch (err) {
    // Gradient fallback when photo load fails or any other error
    try {
      const H = body.size === 'story' ? 1920 : 1080;
      const h = String(body.headline ?? 'AutoBNBs').trim().split(/\s+/).slice(0, 6).join(' ');
      const s = String(body.subtext ?? '').trim().split(/\s+/).slice(0, 18).join(' ');
      return new ImageResponse(<GradientFallback headline={h} subtext={s} H={H} />, {
        width: W,
        height: H,
      });
    } catch {
      return new Response('Design generation failed', { status: 500 });
    }
  }
}
