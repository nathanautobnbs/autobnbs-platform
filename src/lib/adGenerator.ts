import { AdLayout, AdSize } from '@/types';

export interface AdConfig {
  imageUrl: string;
  headline: string;
  subtext: string;
  layout: AdLayout;
  size: AdSize;
  logoUrl: string;
}

const DIMS: Record<AdSize, { w: number; h: number }> = {
  square: { w: 1080, h: 1080 },
  story:  { w: 1080, h: 1920 },
};

// 80px padding each side — max text width = w - 160
const SIDE_PAD = 80;
const BOTTOM_PAD = 50;

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src.startsWith('http') || src.startsWith('/api')
      ? src
      : window.location.origin + src;
  });
}

// Hard limit: first 6 words only
function truncateHeadline(text: string): string {
  return text.trim().split(/\s+/).slice(0, 6).join(' ');
}

// Shrink font until single-line text fits maxWidth
function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  minSize: number,
  weight = '800',
): number {
  let size = startSize;
  while (size > minSize) {
    ctx.font = `${weight} ${size}px Inter, Arial, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 1;
  }
  return size;
}

// Word-wrap — never clips a word, never overflows maxWidth
// Returns Y after the last drawn line
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 5,
): number {
  const words = text.split(' ').filter(Boolean);
  let line = '';
  let currentY = y;
  let lineCount = 0;

  for (const word of words) {
    if (lineCount >= maxLines) break;
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
      lineCount++;
    } else {
      line = test;
    }
  }
  if (line && lineCount < maxLines) {
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

// Cover-fill — image always fills entire canvas, no gaps
function drawBg(ctx: CanvasRenderingContext2D, w: number, h: number, img: HTMLImageElement | null) {
  if (img) {
    const scale = Math.max(w / img.width, h / img.height);
    const sw = img.width * scale;
    const sh = img.height * scale;
    ctx.drawImage(img, (w - sw) / 2, (h - sh) / 2, sw, sh);
  } else {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#111827');
    grad.addColorStop(1, '#1e293b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
}

// Strong bottom gradient — transparent → rgba(0,0,0,0.7)
function drawBottomGradient(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  startFraction = 0.42,
) {
  const scrimStart = Math.round(h * startFraction);
  const scrim = ctx.createLinearGradient(0, scrimStart, 0, h);
  scrim.addColorStop(0, 'rgba(0,0,0,0)');
  scrim.addColorStop(0.45, 'rgba(0,0,0,0.45)');
  scrim.addColorStop(1, 'rgba(0,0,0,0.75)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, scrimStart, w, h - scrimStart);
}

function setTextShadow(ctx: CanvasRenderingContext2D) {
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
}

function clearShadow(ctx: CanvasRenderingContext2D) {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

// Logo — top-right, clean transparent PNG, NO background box
function drawLogo(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  logo: HTMLImageElement | null,
) {
  clearShadow(ctx);
  ctx.save();
  if (logo && logo.width > 0 && logo.height > 0) {
    const logoH = Math.round(w * 0.062);
    const logoW = Math.round((logo.width / logo.height) * logoH);
    ctx.globalAlpha = 0.92;
    ctx.drawImage(logo, w - logoW - SIDE_PAD, SIDE_PAD, logoW, logoH);
    ctx.globalAlpha = 1;
  } else {
    // Clean text fallback — no coloured box
    const fontSize = Math.round(w * 0.028);
    ctx.font = `800 ${fontSize}px Inter, Arial, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 6;
    ctx.textAlign = 'right';
    ctx.fillText('AutoBNBs', w - SIDE_PAD, SIDE_PAD + fontSize);
  }
  ctx.restore();
}

// autobnbs.com — centered at very bottom
function drawWatermark(ctx: CanvasRenderingContext2D, w: number, h: number) {
  clearShadow(ctx);
  ctx.save();
  const size = Math.round(w * 0.022);
  ctx.font = `400 ${size}px Inter, Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.78)';
  ctx.textAlign = 'center';
  ctx.fillText('autobnbs.com', w / 2, h - BOTTOM_PAD);
  ctx.restore();
}

// ── Shared text block ────────────────────────────────────────────────────────
// Draws headline + 16px gap + body text. Text always stays within canvas.

function drawTextBlock(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  headline: string,
  subtext: string,
  headlineStartY: number,
  textX: number,
  maxTextWidth: number,
) {
  // Headline — at least 48px (w*0.044 ≈ 48 at 1080), bold white
  const minHeadlineSize = Math.max(48, Math.round(w * 0.044));
  const startHeadlineSize = Math.round(w * 0.066);
  const headlineSize = fitFontSize(ctx, headline, maxTextWidth, startHeadlineSize, minHeadlineSize);
  const headlineLineH = Math.round(headlineSize * 1.2);

  setTextShadow(ctx);
  ctx.font = `800 ${headlineSize}px Inter, Arial, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  const afterHeadline = wrapText(ctx, headline, textX, headlineStartY, maxTextWidth, headlineLineH, 3);

  // Body text — ~22px, lighter, 16px below headline
  const subSize = Math.max(20, Math.round(w * 0.021));
  const subLineH = Math.round(subSize * 1.5);
  const subY = afterHeadline + 16;

  // Clamp so subtext never goes past the watermark area
  const subYMax = h - BOTTOM_PAD - subSize * 4;
  if (subY < subYMax) {
    setTextShadow(ctx);
    ctx.font = `400 ${subSize}px Inter, Arial, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    wrapText(ctx, subtext, textX, subY, maxTextWidth * 0.9, subLineH, 3);
  }
}

// ── Public entry point ────────────────────────────────────────────────────────

export async function generateAdDataUrl(config: AdConfig): Promise<string> {
  const { w, h } = DIMS[config.size];
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const processedConfig: AdConfig = {
    ...config,
    headline: truncateHeadline(config.headline),
  };

  const [bgImg, logoImg] = await Promise.all([
    loadImage(config.imageUrl).catch(() => null),
    loadImage(config.logoUrl).catch(() => null),
  ]);

  if (config.layout === 'full-bleed') {
    drawFullBleed(ctx, w, h, bgImg, processedConfig, logoImg);
  } else if (config.layout === 'bottom-bar') {
    drawBottomBar(ctx, w, h, bgImg, processedConfig, logoImg);
  } else {
    drawLeftAligned(ctx, w, h, bgImg, processedConfig, logoImg);
  }

  return canvas.toDataURL('image/png');
}

// ── Layout: Full Bleed ────────────────────────────────────────────────────────
// Photo fills canvas. Headline in bottom third over dark gradient.

function drawFullBleed(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  bg: HTMLImageElement | null,
  config: AdConfig,
  logo: HTMLImageElement | null,
) {
  drawBg(ctx, w, h, bg);
  drawBottomGradient(ctx, w, h, 0.42);

  const maxTextWidth = w - SIDE_PAD * 2;
  const headlineY = Math.round(h * 0.66);

  drawTextBlock(ctx, w, h, config.headline, config.subtext, headlineY, SIDE_PAD, maxTextWidth);

  clearShadow(ctx);
  drawWatermark(ctx, w, h);
  drawLogo(ctx, w, h, logo);
}

// ── Layout: Bottom Bar ────────────────────────────────────────────────────────
// Top 58% photo, bottom 42% dark panel. Text centred in the panel.

function drawBottomBar(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  bg: HTMLImageElement | null,
  config: AdConfig,
  logo: HTMLImageElement | null,
) {
  const split = Math.round(h * 0.58);
  const barH = h - split;

  // Photo clipped to top section
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, split);
  ctx.clip();
  drawBg(ctx, w, h, bg);
  const imgScrim = ctx.createLinearGradient(0, split * 0.65, 0, split);
  imgScrim.addColorStop(0, 'rgba(0,0,0,0)');
  imgScrim.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = imgScrim;
  ctx.fillRect(0, 0, w, split);
  ctx.restore();

  // Dark bottom panel
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(0, split, w, barH);
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(0, split, w, 2);

  const maxTextWidth = w - SIDE_PAD * 2;

  // Estimate block height to vertically centre text in the bar
  const estHeadlineSize = Math.round(w * 0.055);
  const estSubSize = Math.max(20, Math.round(w * 0.021));
  const estBlockH = estHeadlineSize * 1.2 * 2 + 16 + estSubSize * 1.5 * 2;
  const headlineY = split + Math.max(SIDE_PAD, (barH - estBlockH) / 2) + estHeadlineSize;

  drawTextBlock(ctx, w, h, config.headline, config.subtext, headlineY, SIDE_PAD, maxTextWidth);

  clearShadow(ctx);
  drawWatermark(ctx, w, h);
  drawLogo(ctx, w, h, logo);
}

// ── Layout: Left Aligned ──────────────────────────────────────────────────────
// Photo fills canvas. Dark left gradient. Headline lower-left.

function drawLeftAligned(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  bg: HTMLImageElement | null,
  config: AdConfig,
  logo: HTMLImageElement | null,
) {
  drawBg(ctx, w, h, bg);

  // Dark left gradient
  const leftGrad = ctx.createLinearGradient(0, 0, w * 0.72, 0);
  leftGrad.addColorStop(0, 'rgba(0,0,0,0.85)');
  leftGrad.addColorStop(0.55, 'rgba(0,0,0,0.55)');
  leftGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = leftGrad;
  ctx.fillRect(0, 0, w, h);

  // Bottom gradient for watermark readability
  drawBottomGradient(ctx, w, h, 0.82);

  // Text fills left half
  const maxTextWidth = Math.round(w * 0.52) - SIDE_PAD;
  const headlineY = Math.round(h * 0.66);

  // Accent bar above headline
  clearShadow(ctx);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillRect(
    SIDE_PAD,
    headlineY - Math.round(h * 0.038),
    Math.round(w * 0.055),
    Math.round(w * 0.005),
  );

  drawTextBlock(ctx, w, h, config.headline, config.subtext, headlineY, SIDE_PAD, maxTextWidth);

  clearShadow(ctx);
  drawWatermark(ctx, w, h);
  drawLogo(ctx, w, h, logo);
}
