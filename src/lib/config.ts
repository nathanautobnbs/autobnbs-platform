import { Platform, ToneOfVoice, ContentPillar } from '@/types';

// Central configuration for the AutoBNBs platform
// All API endpoints, platform settings, and constants live here

export const APP_CONFIG = {
  name: 'AutoBNBs',
  tagline: 'Automated Short-Term Rental Content',
  version: '1.0.0',
  businessType: 'Short-term rental property management',
  targetAudience: 'Property owners looking for passive income through Airbnb automation',
};

export const CLAUDE_CONFIG = {
  model: 'claude-sonnet-4-6',
  maxTokens: 2048,
  systemPrompt: `You are a professional social media content creator specialising in short-term rental property management for AutoBNBs — a company that helps property owners earn passive income through Airbnb automation and professional property management.

You create compelling, platform-specific social media content that:
- Speaks directly to property owners who want to earn passive income
- Highlights the benefits of professional short-term rental management
- Uses a strong hook in the first line to stop the scroll
- Includes relevant, researched hashtags (mix of high and low volume)
- Is tailored specifically to each platform's tone and format
- Drives engagement and builds trust with the AutoBNBs brand`,
};

export const PLATFORM_CONFIG: Record<Platform, {
  label: string;
  color: string;
  bgColor: string;
  lightBg: string;
  textColor: string;
  borderColor: string;
  maxCaptionLength: number;
  maxHashtags: number;
  tone: string;
  emoji: string;
}> = {
  instagram: {
    label: 'Instagram',
    color: '#a855f7',
    bgColor: 'bg-purple-500',
    lightBg: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    maxCaptionLength: 2200,
    maxHashtags: 30,
    tone: 'Visual, aspirational, lifestyle-focused. Use line breaks for readability. Strong call to action.',
    emoji: '📸',
  },
  facebook: {
    label: 'Facebook',
    color: '#3b82f6',
    bgColor: 'bg-blue-500',
    lightBg: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    maxCaptionLength: 63206,
    maxHashtags: 10,
    tone: 'Conversational and community-focused. Longer form is fine. Encourage comments and shares.',
    emoji: '👥',
  },
  linkedin: {
    label: 'LinkedIn',
    color: '#1d4ed8',
    bgColor: 'bg-blue-700',
    lightBg: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    maxCaptionLength: 3000,
    maxHashtags: 5,
    tone: 'Professional, thought-leadership focused. Share insights, data, and business value. Network-building.',
    emoji: '💼',
  },
  twitter: {
    label: 'Twitter / X',
    color: '#111827',
    bgColor: 'bg-gray-900',
    lightBg: 'bg-gray-50',
    textColor: 'text-gray-900',
    borderColor: 'border-gray-300',
    maxCaptionLength: 280,
    maxHashtags: 3,
    tone: 'Punchy, direct, witty. Threads-ready. Concise value delivery. Spark conversation.',
    emoji: '🐦',
  },
  tiktok: {
    label: 'TikTok',
    color: '#111827',
    bgColor: 'bg-gray-900',
    lightBg: 'bg-gray-100',
    textColor: 'text-gray-900',
    borderColor: 'border-gray-300',
    maxCaptionLength: 2200,
    maxHashtags: 10,
    tone: 'Energetic, trend-aware, authentic. Hook in first 3 seconds. Use trending audio references.',
    emoji: '🎵',
  },
  buffer: {
    label: 'Buffer',
    color: '#f97316',
    bgColor: 'bg-orange-500',
    lightBg: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    maxCaptionLength: 5000,
    maxHashtags: 15,
    tone: 'Scheduling tool — adapts to the target platform.',
    emoji: '🔄',
  },
};

export const TONE_CONFIG: Record<ToneOfVoice, { label: string; description: string }> = {
  professional: {
    label: 'Professional',
    description: 'Polished, authoritative, and data-driven. Builds credibility and trust.',
  },
  casual: {
    label: 'Casual',
    description: 'Friendly, approachable, and conversational. Feels like advice from a friend.',
  },
  inspirational: {
    label: 'Inspirational',
    description: 'Motivating and aspirational. Paints a picture of success and possibility.',
  },
  educational: {
    label: 'Educational',
    description: 'Informative and value-packed. Teaches something actionable every post.',
  },
};

export const CONTENT_PILLAR_CONFIG: Record<ContentPillar, { label: string; description: string; color: string }> = {
  'airbnb-tips': {
    label: 'Airbnb Tips',
    description: 'Practical tips for Airbnb hosts to optimise listings and guest experience.',
    color: 'text-red-600 bg-red-50 border-red-200',
  },
  'property-management': {
    label: 'Property Management',
    description: 'Best practices for managing short-term rental properties efficiently.',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  'passive-income': {
    label: 'Passive Income',
    description: 'How to earn income from property without constant hands-on management.',
    color: 'text-green-600 bg-green-50 border-green-200',
  },
  'success-stories': {
    label: 'Success Stories',
    description: 'Real stories from property owners who have transformed their income.',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  'travel-lifestyle': {
    label: 'Travel & Lifestyle',
    description: 'Aspirational travel content that showcases amazing properties.',
    color: 'text-orange-600 bg-orange-50 border-orange-200',
  },
  'market-insights': {
    label: 'Market Insights',
    description: 'Industry data, trends, and insights for short-term rental investors.',
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  },
};

export const PLATFORMS_LIST: Platform[] = ['instagram', 'facebook', 'linkedin', 'twitter', 'tiktok', 'buffer'];

export const SELECTABE_PLATFORMS: Platform[] = ['instagram', 'facebook', 'tiktok', 'linkedin'];

export const IMAGE_CATEGORIES = [
  { id: 'property', label: 'Property', query: 'luxury property airbnb rental' },
  { id: 'lifestyle', label: 'Lifestyle', query: 'passive income lifestyle success' },
  { id: 'travel', label: 'Travel', query: 'travel destination vacation' },
  { id: 'business', label: 'Business', query: 'real estate investment business' },
  { id: 'nature', label: 'Nature', query: 'nature landscape scenic' },
  { id: 'interior', label: 'Interior', query: 'modern interior design home' },
];

export const API_ROUTES = {
  generateContent: '/api/generate-content',
  unsplashSearch: '/api/unsplash',
  schedulePost: '/api/schedule-post',
  cronGenerateDaily: '/api/cron/generate-daily',
};

export const POSTING_TIMES = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00',
];
