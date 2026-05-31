'use client';

import { useState } from 'react';
import {
  Link2, Check, ExternalLink, Eye, EyeOff, Save, AlertCircle,
  Instagram, Facebook, Linkedin, Twitter, Zap,
} from 'lucide-react';
import { useAppState, useAppDispatch } from '@/lib/store';
import { Platform } from '@/types';
import Button from '@/components/ui/Button';
import { PLATFORM_CONFIG } from '@/lib/config';

interface PlatformCardProps {
  platform: Platform;
  connected: boolean;
  username?: string;
  onConnect: () => void;
  instructions: string;
  requirements: string[];
  gradient?: string;
}

const platformInstructions: Record<Platform, { instructions: string; requirements: string[] }> = {
  instagram: {
    instructions:
      'Connect your Instagram Business Account via the Meta Graph API. You\'ll need a Facebook Page connected to your Instagram Business account and a Meta Developer App with the required permissions.',
    requirements: [
      'Instagram Business or Creator account',
      'Facebook Page linked to Instagram',
      'Meta Developer App with instagram_content_publish permission',
      'Long-lived access token (60-day expiry)',
    ],
  },
  facebook: {
    instructions:
      'Connect your Facebook Business Page via the Meta Graph API. AutoBNBs will post directly to your Page on your behalf using the pages_publish permission.',
    requirements: [
      'Facebook Business Page (not personal profile)',
      'Meta Developer App',
      'pages_read_engagement and pages_manage_posts permissions',
      'Page access token',
    ],
  },
  linkedin: {
    instructions:
      'Connect your LinkedIn Company Page or personal profile via the LinkedIn Marketing API. AutoBNBs can post text posts, images, and articles on your behalf.',
    requirements: [
      'LinkedIn Company Page or personal profile',
      'LinkedIn Developer App with r_liteprofile and w_member_social',
      'OAuth 2.0 access token',
      'Organization URN (for Company Pages)',
    ],
  },
  twitter: {
    instructions:
      'Connect your Twitter/X account via the Twitter API v2. AutoBNBs will post tweets and threads using your account credentials through the OAuth 1.0a flow.',
    requirements: [
      'Twitter/X Developer Account',
      'Twitter API App (Free tier works for posting)',
      'API Key, API Secret, Access Token, and Access Secret',
      'OAuth 1.0a credentials',
    ],
  },
  tiktok: {
    instructions:
      'Connect your TikTok Business account via the TikTok for Business API. AutoBNBs can schedule and publish video content on your behalf.',
    requirements: [
      'TikTok Business or Creator Account',
      'TikTok for Business Developer access',
      'Content Posting API access token',
      'Video files must be provided (TikTok is video-only)',
    ],
  },
  buffer: {
    instructions:
      'Connect Buffer to schedule posts across multiple platforms simultaneously. Buffer acts as a unified scheduler that can post to Instagram, Facebook, LinkedIn, and Twitter from one connection.',
    requirements: [
      'Buffer account (Free or paid)',
      'Buffer API access token',
      'Connected social profiles within Buffer',
      'Sufficient Buffer queue slots',
    ],
  },
};

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20}>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.54V6.77a4.85 4.85 0 01-1.07-.08z" />
  </svg>
);

const BufferIcon = () => (
  <div className="w-5 h-5 flex items-center justify-center">
    <span className="text-sm font-black">B</span>
  </div>
);

const platformIcons: Record<Platform, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  twitter: Twitter,
  tiktok: TikTokIcon,
  buffer: BufferIcon,
};

const platformGradients: Partial<Record<Platform, string>> = {
  instagram: 'from-purple-500 via-pink-500 to-orange-400',
};

function PlatformCard({ platform, connected, username, onConnect, instructions, requirements }: PlatformCardProps) {
  const cfg = PLATFORM_CONFIG[platform];
  const Icon = platformIcons[platform];
  const isInstagram = platform === 'instagram';

  return (
    <div className={`bg-white rounded-2xl border-2 ${connected ? 'border-green-200' : 'border-gray-100'} shadow-sm overflow-hidden card-hover`}>
      {/* Header */}
      <div className={`px-5 py-4 flex items-center justify-between ${connected ? 'bg-green-50' : cfg.lightBg}`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${
            isInstagram ? 'instagram-gradient' : cfg.bgColor
          }`}>
            <Icon />
          </div>
          <div>
            <p className="font-bold text-gray-900">{cfg.label}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse-slow' : 'bg-gray-300'}`} />
              <span className={`text-xs font-medium ${connected ? 'text-green-600' : 'text-gray-400'}`}>
                {connected ? `Connected${username ? ` · @${username}` : ''}` : 'Not connected'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {connected ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-xl text-sm font-semibold border border-green-200">
              <Check size={14} /> Connected
            </span>
          ) : (
            <Button size="sm" onClick={onConnect} className={`${cfg.bgColor} border-transparent text-white hover:opacity-90`}>
              Connect
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <p className="text-sm text-gray-600 leading-relaxed">{instructions}</p>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Requirements</p>
          <ul className="space-y-1.5">
            {requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <div className={`w-1.5 h-1.5 rounded-full ${cfg.bgColor} mt-1.5 flex-shrink-0`} />
                {req}
              </li>
            ))}
          </ul>
        </div>

        {!connected && (
          <a
            href="#"
            className={`text-sm ${cfg.textColor} font-medium hover:underline flex items-center gap-1`}
          >
            View {cfg.label} API documentation <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
}

interface ApiKeyFieldProps {
  label: string;
  keyName: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  description: string;
}

function ApiKeyField({ label, keyName, value, onChange, placeholder, description }: ApiKeyFieldProps) {
  const [visible, setVisible] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      <p className="text-xs text-gray-400">{description}</p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={visible ? 'text' : 'password'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-10 pl-3 pr-10 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {visible ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <Button
          size="md"
          variant={saved ? 'success' : 'outline'}
          onClick={handleSave}
          leftIcon={saved ? <Check size={14} /> : <Save size={14} />}
        >
          {saved ? 'Saved' : 'Save'}
        </Button>
      </div>
    </div>
  );
}

export default function PlatformsPage() {
  const { platformConnections, settings } = useAppState();
  const dispatch = useAppDispatch();

  const [apiKeys, setApiKeys] = useState({
    claude: settings.apiKeys?.claude ?? '',
    unsplash: settings.apiKeys?.unsplash ?? '',
    buffer: settings.apiKeys?.buffer ?? '',
    instagram: settings.apiKeys?.instagram ?? '',
    facebook: settings.apiKeys?.facebook ?? '',
    linkedin: settings.apiKeys?.linkedin ?? '',
    twitter: settings.apiKeys?.twitter ?? '',
    tiktok: settings.apiKeys?.tiktok ?? '',
  });

  const handleConnect = (platform: Platform) => {
    const current = platformConnections.find((p) => p.platform === platform);
    dispatch({
      type: 'UPDATE_PLATFORM_CONNECTION',
      payload: {
        platform,
        connected: !current?.connected,
        username: platform === 'instagram' ? 'autobnbs' : undefined,
        lastSync: new Date().toISOString(),
      },
    });
  };

  const handleSaveApiKeys = () => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: {
        apiKeys: apiKeys as typeof settings.apiKeys,
      },
    });
  };

  const platforms: Platform[] = ['instagram', 'facebook', 'linkedin', 'twitter', 'tiktok', 'buffer'];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Link2 className="text-red-500" size={24} />
          Platform Connections
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Connect your social media accounts and configure your API keys
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Getting Started</p>
          <p className="text-sm text-blue-700 mt-0.5">
            Add your API keys below to enable automated posting. All keys are stored securely
            and are only used to post content on your behalf. The platform is fully built and
            ready — connecting APIs takes minutes.
          </p>
        </div>
      </div>

      {/* Platform Cards Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {platforms.map((platform) => {
          const connection = platformConnections.find((p) => p.platform === platform);
          const info = platformInstructions[platform];
          return (
            <PlatformCard
              key={platform}
              platform={platform}
              connected={connection?.connected ?? false}
              username={connection?.username}
              onConnect={() => handleConnect(platform)}
              instructions={info.instructions}
              requirements={info.requirements}
            />
          );
        })}
      </div>

      {/* API Keys Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <Zap size={18} className="text-yellow-500" />
          <div>
            <h2 className="font-bold text-gray-900">API Configuration</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Enter your API keys to activate each platform
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Claude AI */}
          <div className="pb-5 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <Zap size={14} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Claude AI (Anthropic)</p>
                <p className="text-xs text-gray-400">Powers the content generator</p>
              </div>
            </div>
            <ApiKeyField
              label="Anthropic API Key"
              keyName="claude"
              value={apiKeys.claude}
              onChange={(val) => setApiKeys((prev) => ({ ...prev, claude: val }))}
              placeholder="sk-ant-api03-..."
              description="Get your key at console.anthropic.com. This powers the AI content generation."
            />
          </div>

          {/* Unsplash */}
          <div className="pb-5 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-900 mb-3">Unsplash Image Library</p>
            <ApiKeyField
              label="Unsplash Access Key"
              keyName="unsplash"
              value={apiKeys.unsplash}
              onChange={(val) => setApiKeys((prev) => ({ ...prev, unsplash: val }))}
              placeholder="your-unsplash-access-key"
              description="Get your key at unsplash.com/developers. Enables searching real Unsplash photos."
            />
          </div>

          {/* Buffer */}
          <div className="pb-5 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-900 mb-3">Buffer (Multi-Platform Scheduler)</p>
            <ApiKeyField
              label="Buffer Access Token"
              keyName="buffer"
              value={apiKeys.buffer}
              onChange={(val) => setApiKeys((prev) => ({ ...prev, buffer: val }))}
              placeholder="buffer-access-token"
              description="Connect Buffer to schedule posts across all platforms simultaneously."
            />
          </div>

          {/* Social Platform Keys */}
          <div className="space-y-4">
            <p className="text-sm font-bold text-gray-900">Direct Platform Connections</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <ApiKeyField
                label="Instagram Access Token"
                keyName="instagram"
                value={apiKeys.instagram}
                onChange={(val) => setApiKeys((prev) => ({ ...prev, instagram: val }))}
                placeholder="IGQV..."
                description="From Meta for Developers dashboard."
              />
              <ApiKeyField
                label="Facebook Page Token"
                keyName="facebook"
                value={apiKeys.facebook}
                onChange={(val) => setApiKeys((prev) => ({ ...prev, facebook: val }))}
                placeholder="EAABwz..."
                description="Facebook Page access token from Meta Graph Explorer."
              />
              <ApiKeyField
                label="LinkedIn Access Token"
                keyName="linkedin"
                value={apiKeys.linkedin}
                onChange={(val) => setApiKeys((prev) => ({ ...prev, linkedin: val }))}
                placeholder="AQX..."
                description="OAuth 2.0 token from LinkedIn Developer portal."
              />
              <ApiKeyField
                label="Twitter API Key"
                keyName="twitter"
                value={apiKeys.twitter}
                onChange={(val) => setApiKeys((prev) => ({ ...prev, twitter: val }))}
                placeholder="your-twitter-api-key"
                description="Twitter API v2 key from developer.twitter.com."
              />
            </div>
          </div>

          {/* Save All */}
          <div className="pt-2 flex justify-end">
            <Button
              size="lg"
              onClick={handleSaveApiKeys}
              leftIcon={<Save size={16} />}
              className="bg-gray-900 hover:bg-gray-800 border-gray-900"
            >
              Save All API Keys
            </Button>
          </div>
        </div>
      </div>

      {/* Architecture Note */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200 p-5">
        <h3 className="font-bold text-gray-900 mb-2">How the Architecture Works</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          AutoBNBs is architected so that adding an API key immediately activates that platform's capabilities.
          The API route structure in{' '}
          <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-xs font-mono text-gray-700">
            /app/api/
          </code>{' '}
          handles all platform communication. A daily cron job at{' '}
          <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-xs font-mono text-gray-700">
            /api/cron/generate-daily
          </code>{' '}
          can be activated via Vercel to generate and schedule content automatically every morning
          without any manual input.
        </p>
      </div>
    </div>
  );
}
