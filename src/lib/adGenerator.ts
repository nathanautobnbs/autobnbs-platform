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

const PINK = '#FF69B4';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    // Use absolute URL so canvas can resolve it
    img.src = src.startsWith('http') || src.startsWith('/api') ? src : window.location.origin + src;
  });
}

// Auto-sizes font down until text fits in maxWidth on a single line (for short headlines)
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

// Wraps text, returns the Y position after the last line
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

function drawBg(ctx: CanvasRenderingContext2D, w: number, h: number, img: HTMLImageElement | null) {
  if (img) {
    const scale = Math.max(w / img.width, h / img.height);
    const sw = img.width * scale;
    const sh = img.height * scale;
    ctx.drawImage(img, (w - sw) / 2, (h - sh) / 2, sw, sh);
  } else {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#FF69B4');
    grad.addColorStop(1, '#C2185B');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
}

function setShadow(ctx: CanvasRenderingContext2D, blur = 18, alpha = 0.6) {
  ctx.shadowColor = `rgba(0,0,0,${alpha})`;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;
}

function clearShadow(ctx: CanvasRenderingContext2D) {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

function drawLogo(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  logo: HTMLImageElement | null,
) {
  const pad = Math.round(w * 0.045);
  const logoH = Math.round(h * 0.052);

  clearShadow(ctx);
  ctx.save();

  if (logo && logo.width > 0 && logo.height > 0) {
    const logoW = Math.round((logo.width / logo.height) * logoH);
    const x = w - logoW - pad;
    const y = h - logoH - pad;
    // Semi-transparent pill background so logo reads on any image
    const pillPad = 10;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.roundRect(x - pillPad, y - pillPad, logoW + pillPad * 2, logoH + pillPad * 2, 10);
    ctx.fill();
    ctx.drawImage(logo, x, y, logoW, logoH);
  } else {
    // Text fallback badge
    const fontSize = Math.round(w * 0.025);
    ctx.font = `800 ${fontSize}px Inter, Arial, sans-serif`;
    const text = 'AutoBNBs';
    const textW = ctx.measureText(text).width;
    const pillW = textW + 28;
    const pillH = fontSize + 18;
    const x = w - pillW - pad;
    const y = h - pillH - pad;
    ctx.fillStyle = PINK;
    ctx.beginPath();
    ctx.roundRect(x, y, pillW, pillH, 8);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(text, x + pillW / 2, y + pillH / 2 + fontSize * 0.35);
  }
  ctx.restore();
}

function drawWatermark(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const pad = Math.round(w * 0.045);
  const size = Math.round(w * 0.023);
  clearShadow(ctx);
  ctx.save();
  ctx.font = `600 ${size}px Inter, Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.textAlign = 'left';
  ctx.fillText('autobnbs.com', pad, h - pad);
  ctx.restore();
}

export async function generateAdDataUrl(config: AdConfig): Promise<string> {
  const { w, h } = DIMS[config.size];
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const [bgImg, logoImg] = await Promise.all([
    loadImage(config.imageUrl).catch(() => null),
    loadImage(config.logoUrl).catch(() => null),
  ]);

  if (config.layout === 'full-bleed') {
    drawFullBleed(ctx, w, h, bgImg, config, logoImg);
  } else if (config.layout === 'bottom-bar') {
    drawBottomBar(ctx, w, h, bgImg, config, logoImg);
  } else {
    drawLeftAligned(ctx, w, h, bgImg, config, logoImg);
  }

  return canvas.toDataURL('image/png');
}

function drawFullBleed(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  bg: HTMLImageElement | null,
  config: AdConfig,
  logo: HTMLImageElement | null,
) {
  drawBg(ctx, w, h, bg);

  // Subtle pink tint — 25% so the photo shows through clearly
  ctx.fillStyle = 'rgba(255,105,180,0.25)';
  ctx.fillRect(0, 0, w, h);

  // Heavy dark scrim on the BOTTOM third only — text lives there
  const scrimStart = Math.round(h * 0.45);
  const scrim = ctx.createLinearGradient(0, scrimStart, 0, h);
  scrim.addColorStop(0, 'rgba(0,0,0,0)');
  scrim.addColorStop(0.4, 'rgba(0,0,0,0.55)');
  scrim.addColorStop(1, 'rgba(0,0,0,0.80)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, scrimStart, w, h - scrimStart);

  const pad = Math.round(w * 0.08);
  const textW = w - pad * 2;

  // Auto-size headline font to fit within textW (max 3 lines)
  let headlineSize = Math.round(w * 0.072);
  const minHeadlineSize = Math.round(w * 0.042);
  headlineSize = fitFontSize(ctx, config.headline, textW * 0.9, headlineSize, minHeadlineSize, '800');

  // Text block starts at ~65% height (lower third)
  const blockStart = Math.round(h * 0.63);

  setShadow(ctx, 20, 0.65);
  ctx.font = `800 ${headlineSize}px Inter, Arial, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  const afterHeadline = wrapText(ctx, config.headline, pad, blockStart, textW, Math.round(headlineSize * 1.22), 3);

  // Subtext
  const subSize = Math.round(w * 0.031);
  setShadow(ctx, 12, 0.5);
  ctx.font = `400 ${subSize}px Inter, Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.90)';
  wrapText(ctx, config.subtext, pad, afterHeadline + Math.round(subSize * 0.5), textW * 0.85, Math.round(subSize * 1.45), 2);

  drawWatermark(ctx, w, h);
  drawLogo(ctx, w, h, logo);
}

function drawBottomBar(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  bg: HTMLImageElement | null,
  config: AdConfig,
  logo: HTMLImageElement | null,
) {
  const split = Math.round(h * 0.60);

  // Top image area
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, split);
  ctx.clip();
  drawBg(ctx, w, h, bg);
  ctx.fillStyle = 'rgba(255,105,180,0.22)';
  ctx.fillRect(0, 0, w, split);
  ctx.restore();

  // Pink bottom bar
  ctx.fillStyle = PINK;
  ctx.fillRect(0, split, w, h - split);

  // Separator line
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(0, split, w, 3);

  const pad = Math.round(w * 0.07);
  const barH = h - split;
  const textW = w - pad * 2;

  // Auto-size headline
  let headlineSize = Math.round(w * 0.062);
  headlineSize = fitFontSize(ctx, config.headline, textW * 0.88, headlineSize, Math.round(w * 0.036), '800');
  const lineH = Math.round(headlineSize * 1.22);

  // Centre text vertically in the bar
  const textBlockH = lineH * 2 + Math.round(w * 0.03) * 1.4;
  const textStartY = split + (barH - textBlockH) / 2 + headlineSize;

  setShadow(ctx, 8, 0.2);
  ctx.font = `800 ${headlineSize}px Inter, Arial, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  const afterHeadline = wrapText(ctx, config.headline, pad, textStartY, textW * 0.82, lineH, 2);

  const subSize = Math.round(w * 0.028);
  clearShadow(ctx);
  ctx.font = `400 ${subSize}px Inter, Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  wrapText(ctx, config.subtext, pad, afterHeadline + Math.round(subSize * 0.3), textW * 0.78, Math.round(subSize * 1.5), 2);

  drawWatermark(ctx, w, h);
  drawLogo(ctx, w, h, logo);
}

function drawLeftAligned(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  bg: HTMLImageElement | null,
  config: AdConfig,
  logo: HTMLImageElement | null,
) {
  drawBg(ctx, w, h, bg);

  // Horizontal gradient from left — deeper coverage than before
  const grad = ctx.createLinearGradient(0, 0, w * 0.80, 0);
  grad.addColorStop(0, 'rgba(180,15,115,0.88)');
  grad.addColorStop(0.5, 'rgba(255,105,180,0.60)');
  grad.addColorStop(1, 'rgba(255,105,180,0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const pad = Math.round(w * 0.08);
  const textW = Math.round(w * 0.52);
  const blockStart = Math.round(h * 0.30);

  // Decorative accent bar
  clearShadow(ctx);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillRect(pad, blockStart - Math.round(h * 0.055), Math.round(w * 0.06), Math.round(w * 0.007));

  // Auto-size headline
  let headlineSize = Math.round(w * 0.064);
  headlineSize = fitFontSize(ctx, config.headline, textW * 0.95, headlineSize, Math.round(w * 0.038), '800');

  setShadow(ctx, 16, 0.55);
  ctx.font = `800 ${headlineSize}px Inter, Arial, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  const afterHeadline = wrapText(ctx, config.headline, pad, blockStart, textW, Math.round(headlineSize * 1.24), 3);

  const subSize = Math.round(w * 0.030);
  setShadow(ctx, 10, 0.4);
  ctx.font = `400 ${subSize}px Inter, Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.90)';
  wrapText(ctx, config.subtext, pad, afterHeadline + Math.round(subSize * 0.5), textW, Math.round(subSize * 1.5), 2);

  drawWatermark(ctx, w, h);
  drawLogo(ctx, w, h, logo);
}
