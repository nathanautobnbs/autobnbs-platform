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

const PAD_MIN = 60;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src.startsWith('http') || src.startsWith('/api') ? src : window.location.origin + src;
  });
}

// Limit headline to maxWords — keeps the most impactful words
function truncateHeadline(text: string, maxWords = 8): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ');
}

// Shrinks font size until text fits maxWidth on a single line
function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  minSize: number,
  weight: string,
): number {
  let size = startSize;
  while (size > minSize) {
    ctx.font = `${weight} ${size}px Inter, Arial, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 2;
  }
  return size;
}

// Word-wraps text — never clips mid-word, never overflows canvas
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 4,
): number {
  const words = text.split(' ');
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

// Cover-style fill — image always fills entire canvas, no white gaps
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

// Dark bottom gradient — transparent → rgba(0,0,0,0.6) — text always readable
function drawBottomGradient(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  startFraction = 0.45,
) {
  const scrimStart = Math.round(h * startFraction);
  const scrim = ctx.createLinearGradient(0, scrimStart, 0, h);
  scrim.addColorStop(0, 'rgba(0,0,0,0)');
  scrim.addColorStop(0.4, 'rgba(0,0,0,0.40)');
  scrim.addColorStop(1, 'rgba(0,0,0,0.75)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, scrimStart, w, h - scrimStart);
}

// Text shadow: rgba(0,0,0,0.8) 2px 2px 8px — crisp on any background
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

// Logo — larger, no background box, top-right corner
function drawLogo(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  logo: HTMLImageElement | null,
) {
  const pad = Math.max(PAD_MIN, Math.round(w * 0.055));
  const logoH = Math.round(h * 0.068);

  clearShadow(ctx);
  ctx.save();

  if (logo && logo.width > 0 && logo.height > 0) {
    const logoW = Math.round((logo.width / logo.height) * logoH);
    const x = w - logoW - pad;
    const y = pad;
    ctx.globalAlpha = 0.95;
    ctx.drawImage(logo, x, y, logoW, logoH);
    ctx.globalAlpha = 1;
  } else {
    const fontSize = Math.round(w * 0.032);
    ctx.font = `800 ${fontSize}px Inter, Arial, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.textAlign = 'right';
    ctx.fillText('AutoBNBs', w - pad, pad + fontSize);
  }
  ctx.restore();
}

// autobnbs.com — centered at very bottom of every image
function drawWatermark(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const pad = Math.round(w * 0.048);
  const size = Math.round(w * 0.024);
  clearShadow(ctx);
  ctx.save();
  ctx.font = `500 ${size}px Inter, Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.textAlign = 'center';
  ctx.fillText('autobnbs.com', w / 2, h - pad);
  ctx.restore();
}

export async function generateAdDataUrl(config: AdConfig): Promise<string> {
  const { w, h } = DIMS[config.size];
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Highest quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Truncate headline to 8 words max
  const processedConfig: AdConfig = {
    ...config,
    headline: truncateHeadline(config.headline, 8),
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
// Background photo fills canvas, text in lower third over dark gradient

function drawFullBleed(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  bg: HTMLImageElement | null,
  config: AdConfig,
  logo: HTMLImageElement | null,
) {
  drawBg(ctx, w, h, bg);
  drawBottomGradient(ctx, w, h, 0.42);

  const pad = Math.max(PAD_MIN, Math.round(w * 0.08));
  const textW = w - pad * 2;

  let headlineSize = Math.round(w * 0.072);
  headlineSize = fitFontSize(ctx, config.headline, textW, headlineSize, Math.round(w * 0.042), '800');
  const lineH = Math.round(headlineSize * 1.22);

  // Lower third: headline starts at 66% of height
  const blockStart = Math.round(h * 0.66);

  setTextShadow(ctx);
  ctx.font = `800 ${headlineSize}px Inter, Arial, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  const afterHeadline = wrapText(ctx, config.headline, pad, blockStart, textW, lineH, 3);

  const subSize = Math.round(w * 0.031);
  setTextShadow(ctx);
  ctx.font = `400 ${subSize}px Inter, Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  // Clamp subtext so it never goes past bottom padding boundary
  const subY = Math.min(
    afterHeadline + Math.round(subSize * 0.6),
    h - PAD_MIN - Math.round(subSize * 3),
  );
  wrapText(ctx, config.subtext, pad, subY, textW * 0.88, Math.round(subSize * 1.45), 2);

  clearShadow(ctx);
  drawWatermark(ctx, w, h);
  drawLogo(ctx, w, h, logo);
}

// ── Layout: Bottom Bar ────────────────────────────────────────────────────────
// Top 58% is photo, bottom 42% is dark panel with text

function drawBottomBar(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  bg: HTMLImageElement | null,
  config: AdConfig,
  logo: HTMLImageElement | null,
) {
  const split = Math.round(h * 0.58);

  // Draw photo clipped to top section
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, split);
  ctx.clip();
  drawBg(ctx, w, h, bg);
  // Subtle scrim at bottom of photo for smooth transition
  const imgScrim = ctx.createLinearGradient(0, split * 0.65, 0, split);
  imgScrim.addColorStop(0, 'rgba(0,0,0,0)');
  imgScrim.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = imgScrim;
  ctx.fillRect(0, 0, w, split);
  ctx.restore();

  // Dark bottom panel
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(0, split, w, h - split);

  // Subtle separator line
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(0, split, w, 2);

  const pad = Math.max(PAD_MIN, Math.round(w * 0.07));
  const barH = h - split;
  const textW = w - pad * 2;

  let headlineSize = Math.round(w * 0.062);
  headlineSize = fitFontSize(ctx, config.headline, textW, headlineSize, Math.round(w * 0.036), '800');
  const lineH = Math.round(headlineSize * 1.22);

  const estimatedTextH = lineH * 2 + Math.round(w * 0.032) * 1.5;
  const textStartY = split + (barH - estimatedTextH) / 2 + headlineSize;

  setTextShadow(ctx);
  ctx.font = `800 ${headlineSize}px Inter, Arial, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  const afterHeadline = wrapText(ctx, config.headline, pad, textStartY, textW, lineH, 2);

  const subSize = Math.round(w * 0.028);
  setTextShadow(ctx);
  ctx.font = `400 ${subSize}px Inter, Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.78)';
  const subY = Math.min(
    afterHeadline + Math.round(subSize * 0.4),
    h - PAD_MIN - Math.round(subSize * 2.5),
  );
  wrapText(ctx, config.subtext, pad, subY, textW, Math.round(subSize * 1.5), 2);

  clearShadow(ctx);
  drawWatermark(ctx, w, h);
  drawLogo(ctx, w, h, logo);
}

// ── Layout: Left Aligned ──────────────────────────────────────────────────────
// Photo fills canvas, dark left-side gradient, text lower-left

function drawLeftAligned(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  bg: HTMLImageElement | null,
  config: AdConfig,
  logo: HTMLImageElement | null,
) {
  drawBg(ctx, w, h, bg);

  // Dark left-side gradient for text readability
  const leftGrad = ctx.createLinearGradient(0, 0, w * 0.72, 0);
  leftGrad.addColorStop(0, 'rgba(0,0,0,0.82)');
  leftGrad.addColorStop(0.5, 'rgba(0,0,0,0.55)');
  leftGrad.addColorStop(1, 'rgba(0,0,0,0.0)');
  ctx.fillStyle = leftGrad;
  ctx.fillRect(0, 0, w, h);

  // Bottom gradient for watermark area
  drawBottomGradient(ctx, w, h, 0.84);

  const pad = Math.max(PAD_MIN, Math.round(w * 0.08));
  const textW = Math.round(w * 0.54);

  // Lower third
  const blockStart = Math.round(h * 0.64);
  const accentBarY = blockStart - Math.round(h * 0.042);

  // Decorative accent bar above headline
  clearShadow(ctx);
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.fillRect(pad, accentBarY, Math.round(w * 0.06), Math.round(w * 0.006));

  let headlineSize = Math.round(w * 0.064);
  headlineSize = fitFontSize(ctx, config.headline, textW, headlineSize, Math.round(w * 0.038), '800');
  const lineH = Math.round(headlineSize * 1.24);

  setTextShadow(ctx);
  ctx.font = `800 ${headlineSize}px Inter, Arial, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  const afterHeadline = wrapText(ctx, config.headline, pad, blockStart, textW, lineH, 3);

  const subSize = Math.round(w * 0.030);
  setTextShadow(ctx);
  ctx.font = `400 ${subSize}px Inter, Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.90)';
  const subY = Math.min(
    afterHeadline + Math.round(subSize * 0.6),
    h - PAD_MIN - Math.round(subSize * 2.5),
  );
  wrapText(ctx, config.subtext, pad, subY, textW, Math.round(subSize * 1.5), 2);

  clearShadow(ctx);
  drawWatermark(ctx, w, h);
  drawLogo(ctx, w, h, logo);
}
