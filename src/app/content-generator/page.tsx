'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Sparkles, Copy, Check, Edit3, Calendar, Plus,
  Instagram, Facebook, Linkedin, Send, Image as ImageIcon,
  RefreshCw, Tag, Download, ToggleLeft, ToggleRight, Smartphone, Square,
  Loader2,
} from 'lucide-react';
import { useAppState, useAppDispatch } from '@/lib/store';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { GeneratedContent, Platform, ToneOfVoice, AdLayout, AdSize, UnsplashImage } from '@/types';
import { PLATFORM_CONFIG, TONE_CONFIG, CONTENT_PILLAR_CONFIG, SELECTABE_PLATFORMS } from '@/lib/config';
import { generateId, getPlatformColors, copyToClipboard } from '@/lib/utils';
import { generateAdDataUrl } from '@/lib/adGenerator';
import { format } from 'date-fns';

const ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

const PILLAR_QUERIES: Record<string, string> = {
  'airbnb-tips': 'airbnb rental property interior',
  'property-management': 'property management real estate luxury',
  'passive-income': 'passive income lifestyle success wealth',
  'success-stories': 'success business achievement celebration',
  'travel-lifestyle': 'travel vacation luxury destination',
  'market-insights': 'real estate investment market growth',
};

const LAYOUTS: AdLayout[] = ['full-bleed', 'bottom-bar', 'left-aligned'];

const pillarsOptions = Object.entries(CONTENT_PILLAR_CONFIG).map(([id, cfg]) => ({ id, ...cfg }));

const PlatformIcon: Record<Platform, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  tiktok: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.54V6.77a4.85 4.85 0 01-1.07-.08z" />
    </svg>
  ),
  buffer: () => <span className="text-xs font-bold">B</span>,
};

interface AdState {
  loading: boolean;
  dataUrl: string | null;
  image: UnsplashImage | null;
  layout: AdLayout;
}

function extractHeadlineAndSub(caption: string): { headline: string; subtext: string } {
  const lines = caption.split('\n').map(l => l.trim()).filter(Boolean);
  const raw = lines[0] ?? '';
  // Strip non-ASCII (emoji, etc.) for canvas rendering
  // eslint-disable-next-line no-control-regex
  const headline = raw.replace(/[^\x00-\x7F]/g, '').trim().slice(0, 80) || 'Grow your income with AutoBNBs';
  const subLine = lines.slice(1).find(l => l && !l.startsWith('#') && l.length > 10) ?? 'Professional short-term rental management.';
  // eslint-disable-next-line no-control-regex
  const subtext = subLine.replace(/[^\x00-\x7F]/g, '').trim().slice(0, 110);
  return { headline, subtext };
}

async function fetchUnsplashImage(pillar: string): Promise<UnsplashImage | null> {
  if (!ACCESS_KEY) return null;
  const query = PILLAR_QUERIES[pillar] ?? 'airbnb luxury property';
  const page = Math.floor(Math.random() * 4) + 1;
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=5&orientation=landscape&content_filter=high`,
      { headers: { Authorization: `Client-ID ${ACCESS_KEY}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const photos = data.results ?? [];
    if (!photos.length) return null;
    const photo = photos[Math.floor(Math.random() * photos.length)];
    return {
      id: photo.id,
      url: photo.urls.raw
        ? `${photo.urls.raw}&w=1080&q=95&fm=jpg&fit=crop`
        : photo.urls.full ?? photo.urls.regular,
      thumbUrl: photo.urls.small,
      description: photo.description ?? photo.alt_description ?? '',
      authorName: photo.user.name,
      authorUrl: `https://unsplash.com/@${photo.user.username}?utm_source=autobnbs&utm_medium=referral`,
      downloadUrl: photo.links.download_location,
      width: photo.width,
      height: photo.height,
    };
  } catch {
    return null;
  }
}

async function buildAd(content: GeneratedContent, index: number, size: AdSize, image?: UnsplashImage): Promise<{ dataUrl: string; image: UnsplashImage; layout: AdLayout } | null> {
  const img = image ?? await fetchUnsplashImage(content.contentPillar);
  if (!img) return null;

  const { headline, subtext } = extractHeadlineAndSub(content.caption);
  const layout = LAYOUTS[index % LAYOUTS.length];

  try {
    // Pass the original Unsplash URL — the server-side API fetches it directly
    const dataUrl = await generateAdDataUrl({
      imageUrl: img.url,
      headline,
      subtext,
      layout,
      size,
    });
    return { dataUrl, image: img, layout };
  } catch {
    return null;
  }
}

// ── Visual Ad Preview Panel ──────────────────────────────────────────────────

interface AdPanelProps {
  content: GeneratedContent;
  index: number;
  adState: AdState | undefined;
  adSize: AdSize;
  onRegenerate: () => void;
  onSizeChange: (s: AdSize) => void;
  onDownload: () => void;
}

function AdPanel({ content, index, adState, adSize, onRegenerate, onSizeChange, onDownload }: AdPanelProps) {
  const isSquare = adSize === 'square';
  const aspectClass = isSquare ? 'aspect-square' : 'aspect-[9/16]';

  return (
    <div className="flex flex-col gap-3">
      {/* Size toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSizeChange('square')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            isSquare ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300'
          }`}
        >
          <Square size={12} /> Square
        </button>
        <button
          onClick={() => onSizeChange('story')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            !isSquare ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300'
          }`}
        >
          <Smartphone size={12} /> Story
        </button>
        <span className="text-xs text-gray-400 ml-auto">
          {isSquare ? '1080×1080' : '1080×1920'}
        </span>
      </div>

      {/* Canvas preview */}
      <div className={`relative w-full ${aspectClass} bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl overflow-hidden border border-pink-100`}>
        {adState?.loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Loader2 size={28} className="text-pink-400 animate-spin" />
            <p className="text-xs text-pink-500 font-medium">Creating visual ad…</p>
          </div>
        )}
        {!adState?.loading && adState?.dataUrl && (
          <img
            src={adState.dataUrl}
            alt="Generated visual ad"
            className="w-full h-full object-cover"
          />
        )}
        {!adState?.loading && !adState?.dataUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-pink-400">
            <ImageIcon size={32} />
            <p className="text-xs font-medium">No visual yet</p>
          </div>
        )}
        {/* Layout badge */}
        {adState?.layout && (
          <div className="absolute top-2 left-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded-md capitalize">
            {adState.layout.replace('-', ' ')}
          </div>
        )}
      </div>

      {/* Attribution */}
      {adState?.image && (
        <p className="text-xs text-gray-400">
          Photo by{' '}
          <a href={adState.image.authorUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
            {adState.image.authorName}
          </a>{' '}
          on{' '}
          <a href="https://unsplash.com?utm_source=autobnbs&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
            Unsplash
          </a>
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={onRegenerate}
          disabled={adState?.loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:border-pink-300 hover:text-pink-600 transition-all disabled:opacity-40"
        >
          <RefreshCw size={12} className={adState?.loading ? 'animate-spin' : ''} />
          New Image
        </button>
        <button
          onClick={onDownload}
          disabled={!adState?.dataUrl || adState.loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-500 text-white text-xs font-medium hover:bg-pink-600 transition-all disabled:opacity-40 ml-auto"
        >
          <Download size={12} />
          Download Ad
        </button>
      </div>
    </div>
  );
}

// ── Content Card ─────────────────────────────────────────────────────────────

interface ContentCardProps {
  content: GeneratedContent;
  index: number;
  showVisualAd: boolean;
  adState: AdState | undefined;
  adSize: AdSize;
  onEdit: (c: GeneratedContent) => void;
  onSchedule: (c: GeneratedContent) => void;
  onApprove: (c: GeneratedContent) => void;
  onCopyCaption: (text: string) => void;
  onRegenerateAd: (id: string) => void;
  onAdSizeChange: (id: string, s: AdSize) => void;
  onDownloadAd: (id: string) => void;
  copiedId: string | null;
}

function ContentCard({
  content, index, showVisualAd, adState, adSize,
  onEdit, onSchedule, onApprove, onCopyCaption,
  onRegenerateAd, onAdSizeChange, onDownloadAd, copiedId,
}: ContentCardProps) {
  const colors = getPlatformColors(content.platform);
  const Icon = PlatformIcon[content.platform] ?? (() => null);
  const pillarConfig = CONTENT_PILLAR_CONFIG[content.contentPillar as keyof typeof CONTENT_PILLAR_CONFIG];
  const isCopied = copiedId === content.id;

  return (
    <div className={`bg-white rounded-2xl border-2 ${content.approved ? 'border-green-200' : 'border-gray-100'} shadow-sm overflow-hidden transition-all`}>
      {/* Header */}
      <div className={`px-5 py-3 flex items-center justify-between ${colors.lightBg} border-b border-gray-100`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg ${colors.bgColor} flex items-center justify-center text-white`}>
            <Icon />
          </div>
          <div>
            <p className={`text-sm font-bold ${colors.textColor}`}>{colors.label}</p>
            <p className="text-xs text-gray-400">Platform-optimised</p>
          </div>
        </div>
        {content.approved && (
          <Badge className="text-green-600 bg-green-50 border-green-200">
            <Check size={10} className="mr-1" /> Approved
          </Badge>
        )}
      </div>

      {/* Body — side by side when visual ad mode on */}
      <div className={showVisualAd ? 'flex flex-col lg:flex-row' : ''}>
        {/* Caption side */}
        <div className={`flex flex-col ${showVisualAd ? 'lg:w-1/2 border-b lg:border-b-0 lg:border-r border-gray-100' : ''}`}>
          <div className="px-5 py-4">
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-52 overflow-y-auto pr-1">
              {content.caption}
            </div>
          </div>

          <div className="px-5 pb-3">
            <div className="flex flex-wrap gap-1.5">
              {content.hashtags.slice(0, 8).map((tag) => (
                <span key={tag} className={`text-xs px-2 py-0.5 rounded-md border font-medium ${colors.lightBg} ${colors.textColor} ${colors.borderColor}`}>
                  {tag}
                </span>
              ))}
              {content.hashtags.length > 8 && (
                <span className="text-xs px-2 py-0.5 rounded-md border font-medium text-gray-500 bg-gray-50 border-gray-200">
                  +{content.hashtags.length - 8} more
                </span>
              )}
            </div>
          </div>

          {!showVisualAd && (
            <div className="px-5 pb-4">
              <div className="flex items-start gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <ImageIcon size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-0.5">Suggested Image</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{content.imageDescription}</p>
                </div>
              </div>
            </div>
          )}

          {pillarConfig && (
            <div className="px-5 pb-3">
              <div className="flex items-center gap-1.5">
                <Tag size={11} className="text-gray-400" />
                <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${pillarConfig.color}`}>
                  {pillarConfig.label}
                </span>
              </div>
            </div>
          )}

          <div className="px-4 pb-4 flex flex-wrap gap-2 border-t border-gray-50 pt-3 mt-auto">
            <Button size="sm" variant="outline"
              onClick={() => onCopyCaption(content.caption + '\n\n' + content.hashtags.join(' '))}
              leftIcon={isCopied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
              className={isCopied ? 'text-green-600 border-green-200 bg-green-50' : ''}
            >
              {isCopied ? 'Copied!' : 'Copy'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => onEdit(content)} leftIcon={<Edit3 size={12} />}>Edit</Button>
            <Button size="sm" variant="outline" onClick={() => onSchedule(content)} leftIcon={<Calendar size={12} />}>Schedule</Button>
            <Button
              size="sm"
              onClick={() => onApprove(content)}
              className={content.approved ? 'bg-green-600 hover:bg-green-700 border-green-600' : 'bg-purple-600 hover:bg-purple-700 border-purple-600'}
              leftIcon={content.approved ? <Check size={12} /> : <Plus size={12} />}
            >
              {content.approved ? 'Approved' : 'Approve & Queue'}
            </Button>
          </div>
        </div>

        {/* Visual Ad side */}
        {showVisualAd && (
          <div className="px-5 py-4 lg:w-1/2">
            <AdPanel
              content={content}
              index={index}
              adState={adState}
              adSize={adSize}
              onRegenerate={() => onRegenerateAd(content.id)}
              onSizeChange={(s) => onAdSizeChange(content.id, s)}
              onDownload={() => onDownloadAd(content.id)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ContentGeneratorPage() {
  const { settings, generatedContent } = useAppState();
  const dispatch = useAppDispatch();

  const [businessName, setBusinessName] = useState(settings.business.name || 'AutoBNBs');
  const [selectedPillars, setSelectedPillars] = useState<string[]>([]);
  const [tone, setTone] = useState<ToneOfVoice>('inspirational');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [numberOfPosts, setNumberOfPosts] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<GeneratedContent | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [scheduleModalContent, setScheduleModalContent] = useState<GeneratedContent | null>(null);
  const [scheduleDate, setScheduleDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [isScheduling, setIsScheduling] = useState(false);

  // Visual ad state
  const [visualAdMode, setVisualAdMode] = useState(true);
  const [globalAdSize, setGlobalAdSize] = useState<AdSize>('square');
  const [adVisuals, setAdVisuals] = useState<Map<string, AdState>>(new Map());

  const updateAd = useCallback((id: string, patch: Partial<AdState>) => {
    setAdVisuals(prev => {
      const next = new Map(prev);
      const existing = next.get(id) ?? { loading: false, dataUrl: null, image: null, layout: 'full-bleed' };
      next.set(id, { ...existing, ...patch });
      // Keep only last 10
      if (next.size > 10) {
        const oldest = next.keys().next().value;
        if (oldest) next.delete(oldest);
      }
      return next;
    });
  }, []);

  const generateAdForContent = useCallback(async (content: GeneratedContent, index: number, size: AdSize, existingImage?: UnsplashImage) => {
    updateAd(content.id, { loading: true, dataUrl: null });
    const result = await buildAd(content, index, size, existingImage);
    if (result) {
      updateAd(content.id, { loading: false, dataUrl: result.dataUrl, image: result.image, layout: result.layout });
    } else {
      updateAd(content.id, { loading: false });
    }
  }, [updateAd]);

  const togglePillar = (id: string) =>
    setSelectedPillars(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);

  const togglePlatform = (p: Platform) =>
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const handleGenerate = async () => {
    if (selectedPillars.length === 0 || selectedPlatforms.length === 0) {
      setError('Please select at least one content pillar and one platform.');
      return;
    }
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, contentPillars: selectedPillars, tone, platforms: selectedPlatforms, numberOfPosts }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Generation failed');

      const newContent: GeneratedContent[] = data.content;
      dispatch({ type: 'ADD_GENERATED_CONTENT', payload: newContent });

      // Generate visuals in parallel if mode is on
      if (visualAdMode) {
        newContent.forEach((c, i) => {
          generateAdForContent(c, i, globalAdSize);
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateAd = useCallback((id: string) => {
    const content = generatedContent.find(c => c.id === id);
    if (!content) return;
    const index = generatedContent.findIndex(c => c.id === id);
    generateAdForContent(content, index, globalAdSize);
  }, [generatedContent, globalAdSize, generateAdForContent]);

  const handleAdSizeChange = useCallback((id: string, size: AdSize) => {
    const content = generatedContent.find(c => c.id === id);
    if (!content) return;
    const index = generatedContent.findIndex(c => c.id === id);
    const existing = adVisuals.get(id);
    generateAdForContent(content, index, size, existing?.image ?? undefined);
  }, [generatedContent, adVisuals, generateAdForContent]);

  const handleDownloadAd = useCallback((id: string) => {
    const ad = adVisuals.get(id);
    if (!ad?.dataUrl) return;
    const a = document.createElement('a');
    a.href = ad.dataUrl;
    a.download = `autobnbs-ad-${id}.png`;
    a.click();
  }, [adVisuals]);

  // When visual ad mode toggled ON, generate ads for existing content
  const prevVisualAdMode = useRef(visualAdMode);
  useEffect(() => {
    if (visualAdMode && !prevVisualAdMode.current && generatedContent.length > 0) {
      generatedContent.forEach((c, i) => {
        if (!adVisuals.has(c.id)) {
          generateAdForContent(c, i, globalAdSize);
        }
      });
    }
    prevVisualAdMode.current = visualAdMode;
  }, [visualAdMode]);

  const handleCopyCaption = useCallback(async (text: string, id: string = 'temp') => {
    await copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleSaveEdit = () => {
    if (!editingContent) return;
    dispatch({ type: 'UPDATE_GENERATED_CONTENT', payload: { ...editingContent, caption: editCaption } });
    setEditingContent(null);
  };

  const handleApprove = (content: GeneratedContent) =>
    dispatch({ type: 'UPDATE_GENERATED_CONTENT', payload: { ...content, approved: !content.approved } });

  const handleConfirmSchedule = async () => {
    if (!scheduleModalContent) return;
    setIsScheduling(true);
    try {
      const post = {
        id: generateId(),
        caption: scheduleModalContent.caption,
        hashtags: scheduleModalContent.hashtags,
        imageDescription: scheduleModalContent.imageDescription,
        platform: scheduleModalContent.platform,
        status: 'scheduled' as const,
        scheduledAt: new Date(scheduleDate).toISOString(),
        businessName: settings.business.name,
        contentPillar: scheduleModalContent.contentPillar,
        tone,
        createdAt: new Date().toISOString(),
      };
      await fetch('/api/schedule-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
      dispatch({ type: 'ADD_POST', payload: post });
      setScheduleModalContent(null);
    } finally {
      setIsScheduling(false);
    }
  };

  const approvedCount = generatedContent.filter(c => c.approved).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="text-purple-600" size={24} />
            Content Generator
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            AI-powered captions built specifically for AutoBNBs — short-term rental management
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Caption + Visual Ad toggle */}
          <button
            onClick={() => setVisualAdMode(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
              visualAdMode
                ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300'
            }`}
          >
            {visualAdMode ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
            {visualAdMode ? 'Caption + Visual Ad' : 'Caption Only'}
          </button>
          {generatedContent.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              {approvedCount} approved · {generatedContent.length} generated
            </div>
          )}
        </div>
      </div>

      {/* Generator Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <h2 className="font-bold text-gray-900">Content Settings</h2>
          <p className="text-sm text-gray-500 mt-0.5">Configure your AI content generation</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="AutoBNBs"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tone of Voice</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(TONE_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setTone(key as ToneOfVoice)}
                    className={`h-10 px-3 rounded-xl border text-sm font-medium transition-all ${
                      tone === key ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Content Pillars <span className="text-gray-400 font-normal ml-1">(select all that apply)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {pillarsOptions.map(pillar => (
                <button
                  key={pillar.id}
                  onClick={() => togglePillar(pillar.id)}
                  className={`px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${
                    selectedPillars.includes(pillar.id) ? pillar.color + ' border-current' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {pillar.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Target Platforms</label>
              <div className="flex flex-wrap gap-2">
                {/* Instagram */}
                <button
                  onClick={() => togglePlatform('instagram')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                    selectedPlatforms.includes('instagram') ? 'bg-purple-500 text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Instagram size={16} /> Instagram
                </button>
                {/* Facebook */}
                <button
                  onClick={() => togglePlatform('facebook')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                    selectedPlatforms.includes('facebook') ? 'bg-blue-500 text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Facebook size={16} /> Facebook
                </button>
                {/* TikTok */}
                <button
                  onClick={() => togglePlatform('tiktok')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                    selectedPlatforms.includes('tiktok') ? 'bg-gray-900 text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <PlatformIcon.tiktok /> TikTok
                </button>
                {/* LinkedIn */}
                <button
                  onClick={() => togglePlatform('linkedin')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                    selectedPlatforms.includes('linkedin') ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                  style={selectedPlatforms.includes('linkedin') ? { backgroundColor: '#0A66C2' } : undefined}
                >
                  <Linkedin size={16} /> LinkedIn
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Number of Posts: <span className="text-purple-600">{numberOfPosts}</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={1} max={10} value={numberOfPosts}
                  onChange={e => setNumberOfPosts(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <span className="w-8 text-center font-bold text-purple-600">{numberOfPosts}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1</span><span>10</span></div>
            </div>
          </div>

          {/* Visual ad info banner */}
          {visualAdMode && (
            <div className="flex items-center gap-3 bg-pink-50 border border-pink-100 rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center flex-shrink-0">
                <ImageIcon size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-pink-700">Visual Ad mode is ON</p>
                <p className="text-xs text-pink-500">A professionally designed ad will be generated automatically for each post using Unsplash photos — ready to download and post.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button
              size="lg"
              loading={isGenerating}
              onClick={handleGenerate}
              leftIcon={<Sparkles size={18} />}
              className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 border-0 shadow-md"
            >
              {isGenerating ? 'Generating with AI...' : 'Generate Content'}
            </Button>
            {generatedContent.length > 0 && (
              <Button size="lg" variant="outline" onClick={handleGenerate} loading={isGenerating} leftIcon={<RefreshCw size={16} />}>
                Regenerate
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Generating loading state */}
      {isGenerating && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={32} className="text-purple-600 animate-pulse" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">Generating your content…</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Claude AI is crafting {numberOfPosts} platform-optimised posts.
            {visualAdMode && ' Branded visual ads will render automatically after.'}
          </p>
          <div className="flex justify-center gap-1.5 mt-6">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* Generated Content */}
      {!isGenerating && generatedContent.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-lg">
              Generated Content
              <span className="ml-2 text-sm font-normal text-gray-500">{generatedContent.length} posts</span>
            </h2>
            {approvedCount > 0 && (
              <span className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full border border-green-200">
                {approvedCount} approved
              </span>
            )}
          </div>

          {/* Single column when visual ad mode on (cards are wide), 2-col when off */}
          <div className={visualAdMode ? 'flex flex-col gap-4' : 'grid md:grid-cols-2 gap-4'}>
            {generatedContent.map((content, i) => (
              <ContentCard
                key={content.id}
                content={content}
                index={i}
                showVisualAd={visualAdMode}
                adState={adVisuals.get(content.id)}
                adSize={globalAdSize}
                onEdit={c => { setEditingContent(c); setEditCaption(c.caption); }}
                onSchedule={setScheduleModalContent}
                onApprove={handleApprove}
                onCopyCaption={text => handleCopyCaption(text, content.id)}
                onRegenerateAd={handleRegenerateAd}
                onAdSizeChange={handleAdSizeChange}
                onDownloadAd={handleDownloadAd}
                copiedId={copiedId}
              />
            ))}
          </div>
        </>
      )}

      {!isGenerating && generatedContent.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={32} className="text-purple-400" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">Ready to generate</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Configure your settings above and click "Generate Content" to create AI-powered social media posts for AutoBNBs.
          </p>
        </div>
      )}

      {/* Edit Modal */}
      <Modal open={!!editingContent} onClose={() => setEditingContent(null)} title="Edit Caption" size="lg">
        <div className="p-6 space-y-4">
          {editingContent && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded-lg ${getPlatformColors(editingContent.platform).bgColor} flex items-center justify-center text-white`}>
                  {(() => { const I = PlatformIcon[editingContent.platform] ?? (() => null); return <I />; })()}
                </div>
                <span className="text-sm font-semibold text-gray-700">{getPlatformColors(editingContent.platform).label}</span>
              </div>
              <textarea
                value={editCaption}
                onChange={e => setEditCaption(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none leading-relaxed"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">{editCaption.length} characters</span>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEditingContent(null)}>Cancel</Button>
                  <Button onClick={handleSaveEdit} className="bg-purple-600 hover:bg-purple-700 border-purple-600">Save Changes</Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Schedule Modal */}
      <Modal open={!!scheduleModalContent} onClose={() => setScheduleModalContent(null)} title="Schedule Post">
        <div className="p-6 space-y-4">
          {scheduleModalContent && (
            <>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-sm text-gray-600 line-clamp-3">{scheduleModalContent.caption}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Schedule Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={e => setScheduleDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 text-xs text-blue-700">
                Platform: {getPlatformColors(scheduleModalContent.platform).label}. Connect platforms in Settings to enable automatic publishing.
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setScheduleModalContent(null)} className="flex-1">Cancel</Button>
                <Button loading={isScheduling} onClick={handleConfirmSchedule} leftIcon={<Send size={14} />} className="flex-1 bg-blue-600 hover:bg-blue-700 border-blue-600">
                  Schedule Post
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
