'use client';

import { useState } from 'react';
import {
  Settings, Building2, Sliders, Bell, User, AlertTriangle,
  Save, Check, Instagram, Facebook, Linkedin, Clock,
} from 'lucide-react';
import { useAppState, useAppDispatch } from '@/lib/store';
import { Platform, ToneOfVoice, ContentPillar } from '@/types';
import Button from '@/components/ui/Button';
import {
  TONE_CONFIG, CONTENT_PILLAR_CONFIG, PLATFORM_CONFIG,
  POSTING_TIMES, SELECTABE_PLATFORMS,
} from '@/lib/config';

type Section = 'business' | 'content' | 'notifications' | 'account' | 'danger';

interface SectionTabProps {
  id: Section;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
  accent: string;
}

function SectionTab({ id, label, icon: Icon, active, onClick, accent }: SectionTabProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-all ${
        active ? `${accent} font-semibold` : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon size={16} className={active ? '' : 'text-gray-400'} />
      {label}
    </button>
  );
}

function SavedBanner({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium animate-fade-in">
      <Check size={16} className="text-green-400" />
      Settings saved successfully
    </div>
  );
}

const PlatformIcon: Record<Platform, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  tiktok: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.54V6.77a4.85 4.85 0 01-1.07-.08z" />
    </svg>
  ),
  buffer: () => <span className="text-xs font-bold">B</span>,
};

export default function SettingsPage() {
  const { settings } = useAppState();
  const dispatch = useAppDispatch();

  const [activeSection, setActiveSection] = useState<Section>('business');
  const [saved, setSaved] = useState(false);

  // Local form state
  const [business, setBusiness] = useState({ ...settings.business });
  const [contentPrefs, setContentPrefs] = useState({ ...settings.contentPreferences });
  const [notifications, setNotifications] = useState({ ...settings.notifications });
  const [account, setAccount] = useState({
    username: 'admin',
    email: settings.business.email || 'contact@autobnbs.com',
  });

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: {
        business: activeSection === 'account'
          ? { ...business, email: account.email }
          : business,
        contentPreferences: contentPrefs,
        notifications,
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClearPosts = () => {
    if (window.confirm('Are you sure? This will clear ALL scheduled posts. This cannot be undone.')) {
      dispatch({ type: 'SET_POSTS', payload: [] });
    }
  };

  const handleResetConnections = () => {
    if (window.confirm('Reset all platform connections? You will need to reconnect each platform.')) {
      dispatch({
        type: 'SET_PLATFORM_CONNECTIONS',
        payload: [
          { platform: 'instagram', connected: false },
          { platform: 'facebook', connected: false },
          { platform: 'linkedin', connected: false },
          { platform: 'tiktok', connected: false },
          { platform: 'buffer', connected: false },
        ],
      });
    }
  };

  const toggleDefaultPlatform = (platform: Platform) => {
    setContentPrefs((prev) => ({
      ...prev,
      defaultPlatforms: prev.defaultPlatforms.includes(platform)
        ? prev.defaultPlatforms.filter((p) => p !== platform)
        : [...prev.defaultPlatforms, platform],
    }));
  };

  const toggleDefaultPillar = (pillar: ContentPillar) => {
    setContentPrefs((prev) => ({
      ...prev,
      defaultContentPillars: prev.defaultContentPillars.includes(pillar)
        ? prev.defaultContentPillars.filter((p) => p !== pillar)
        : [...prev.defaultContentPillars, pillar],
    }));
  };

  const togglePreferredTime = (time: string) => {
    setContentPrefs((prev) => ({
      ...prev,
      preferredTimes: prev.preferredTimes.includes(time)
        ? prev.preferredTimes.filter((t) => t !== time)
        : [...prev.preferredTimes, time].sort(),
    }));
  };

  const sections: { id: Section; label: string; icon: React.ElementType; accent: string }[] = [
    { id: 'business', label: 'Business Profile', icon: Building2, accent: 'text-blue-600 bg-blue-50' },
    { id: 'content', label: 'Content Preferences', icon: Sliders, accent: 'text-purple-600 bg-purple-50' },
    { id: 'notifications', label: 'Notifications', icon: Bell, accent: 'text-green-600 bg-green-50' },
    { id: 'account', label: 'Account', icon: User, accent: 'text-orange-600 bg-orange-50' },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, accent: 'text-red-600 bg-red-50' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="text-gray-600" size={24} />
          Settings
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your AutoBNBs platform configuration</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Sidebar Navigation */}
        <aside className="lg:w-52 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 space-y-0.5">
            {sections.map((s) => (
              <SectionTab
                key={s.id}
                id={s.id}
                label={s.label}
                icon={s.icon}
                active={activeSection === s.id}
                onClick={() => setActiveSection(s.id)}
                accent={s.accent}
              />
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Business Profile */}
          {activeSection === 'business' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-blue-50">
                <h2 className="font-bold text-gray-900">Business Profile</h2>
                <p className="text-sm text-gray-500 mt-0.5">Your company information used in AI content generation</p>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: 'Business Name', key: 'name', type: 'text', placeholder: 'AutoBNBs' },
                  { label: 'Industry', key: 'industry', type: 'text', placeholder: 'Short-Term Rental Property Management' },
                  { label: 'Target Audience', key: 'targetAudience', type: 'text', placeholder: 'Property owners looking for passive income' },
                  { label: 'Website URL', key: 'website', type: 'url', placeholder: 'https://autobnbs.com' },
                  { label: 'Contact Email', key: 'email', type: 'email', placeholder: 'hello@autobnbs.com' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.label}</label>
                    <input
                      type={field.type}
                      value={business[field.key as keyof typeof business]}
                      onChange={(e) =>
                        setBusiness((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      placeholder={field.placeholder}
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
                <div className="pt-2">
                  <Button size="lg" onClick={handleSave} leftIcon={<Save size={16} />}>
                    Save Business Profile
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Content Preferences */}
          {activeSection === 'content' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-purple-50">
                <h2 className="font-bold text-gray-900">Content Preferences</h2>
                <p className="text-sm text-gray-500 mt-0.5">Default settings for content generation</p>
              </div>
              <div className="p-6 space-y-6">
                {/* Default Tone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Default Tone of Voice</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(TONE_CONFIG).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => setContentPrefs((prev) => ({ ...prev, defaultTone: key as ToneOfVoice }))}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          contentPrefs.defaultTone === key
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <p className="text-sm font-semibold">{cfg.label}</p>
                        <p className={`text-xs mt-0.5 ${contentPrefs.defaultTone === key ? 'text-purple-200' : 'text-gray-400'}`}>
                          {cfg.description.slice(0, 50)}...
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Default Platforms */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Default Platforms</label>
                  <div className="flex flex-wrap gap-2">
                    {SELECTABE_PLATFORMS.map((platform) => {
                      const cfg = PLATFORM_CONFIG[platform];
                      const Icon = PlatformIcon[platform];
                      const isSelected = contentPrefs.defaultPlatforms.includes(platform);
                      return (
                        <button
                          key={platform}
                          onClick={() => toggleDefaultPlatform(platform)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                            isSelected
                              ? `${cfg.bgColor} text-white border-transparent`
                              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon /> {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Default Content Pillars */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Default Content Pillars</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(CONTENT_PILLAR_CONFIG).map(([key, cfg]) => {
                      const isSelected = contentPrefs.defaultContentPillars.includes(key as ContentPillar);
                      return (
                        <button
                          key={key}
                          onClick={() => toggleDefaultPillar(key as ContentPillar)}
                          className={`px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${
                            isSelected
                              ? cfg.color + ' border-current'
                              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Posting Frequency */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Posting Frequency</label>
                  <div className="flex gap-2">
                    {(['daily', 'weekly', 'custom'] as const).map((freq) => (
                      <button
                        key={freq}
                        onClick={() => setContentPrefs((prev) => ({ ...prev, postingFrequency: freq }))}
                        className={`flex-1 py-2 rounded-xl border text-sm font-medium capitalize transition-all ${
                          contentPrefs.postingFrequency === freq
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-gray-600 border-gray-200'
                        }`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred Times */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preferred Posting Times
                    <span className="text-gray-400 font-normal ml-1">(select all that apply)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {POSTING_TIMES.map((time) => {
                      const isSelected = contentPrefs.preferredTimes.includes(time);
                      return (
                        <button
                          key={time}
                          onClick={() => togglePreferredTime(time)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <Clock size={10} />
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button size="lg" onClick={handleSave} leftIcon={<Save size={16} />}
                  className="bg-purple-600 hover:bg-purple-700 border-purple-600">
                  Save Content Preferences
                </Button>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-green-50">
                <h2 className="font-bold text-gray-900">Notification Preferences</h2>
                <p className="text-sm text-gray-500 mt-0.5">Control when and how AutoBNBs alerts you</p>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notification Email</label>
                  <input
                    type="email"
                    value={notifications.notificationEmail}
                    onChange={(e) => setNotifications((prev) => ({ ...prev, notificationEmail: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="admin@autobnbs.com"
                  />
                </div>

                {[
                  { key: 'emailScheduledPosts', label: 'Email when posts are scheduled', description: 'Receive a confirmation when a new post is added to the queue' },
                  { key: 'emailFailedPosts', label: 'Email when posts fail', description: 'Get alerted immediately if a post fails to publish' },
                  { key: 'weeklyPerformanceSummary', label: 'Weekly performance summary', description: 'A weekly email summarising your content performance across all platforms' },
                ].map((pref) => (
                  <div key={pref.key} className="flex items-start justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{pref.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{pref.description}</p>
                    </div>
                    <button
                      onClick={() =>
                        setNotifications((prev) => ({
                          ...prev,
                          [pref.key]: !prev[pref.key as keyof typeof prev],
                        }))
                      }
                      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${
                        notifications[pref.key as keyof typeof notifications]
                          ? 'bg-green-500'
                          : 'bg-gray-200'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          notifications[pref.key as keyof typeof notifications]
                            ? 'translate-x-5'
                            : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}

                <Button size="lg" onClick={handleSave} leftIcon={<Save size={16} />}
                  className="bg-green-600 hover:bg-green-700 border-green-600">
                  Save Notification Preferences
                </Button>
              </div>
            </div>
          )}

          {/* Account */}
          {activeSection === 'account' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-orange-50">
                <h2 className="font-bold text-gray-900">Account Details</h2>
                <p className="text-sm text-gray-500 mt-0.5">Manage your login credentials and plan</p>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
                    <input
                      type="text"
                      value={account.username}
                      onChange={(e) => setAccount((prev) => ({ ...prev, username: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={account.email}
                      onChange={(e) => setAccount((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Change Password</p>
                  <div className="space-y-3">
                    {['Current Password', 'New Password', 'Confirm New Password'].map((label) => (
                      <div key={label}>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                        <input
                          type="password"
                          className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <p className="text-sm font-semibold text-orange-800 mb-0.5">Current Plan</p>
                  <p className="text-sm text-orange-700">AutoBNBs Pro — Unlimited content generation, all platform connections</p>
                  <button className="text-xs text-orange-600 underline mt-1 font-medium">
                    Manage subscription
                  </button>
                </div>

                <Button size="lg" onClick={handleSave} leftIcon={<Save size={16} />}
                  className="bg-orange-500 hover:bg-orange-600 border-orange-500">
                  Save Account Settings
                </Button>
              </div>
            </div>
          )}

          {/* Danger Zone */}
          {activeSection === 'danger' && (
            <div className="bg-white rounded-2xl border-2 border-red-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-red-100 bg-red-50">
                <h2 className="font-bold text-red-900 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-500" />
                  Danger Zone
                </h2>
                <p className="text-sm text-red-600 mt-0.5">
                  These actions are irreversible. Proceed with caution.
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="border border-red-200 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Clear All Scheduled Posts</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Remove all posts from the queue. Published posts are not affected.
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleClearPosts}
                    className="flex-shrink-0"
                  >
                    Clear Queue
                  </Button>
                </div>

                <div className="border border-red-200 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Reset Platform Connections</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Disconnect all social media platforms. You'll need to reconnect them manually.
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleResetConnections}
                    className="flex-shrink-0"
                  >
                    Disconnect All
                  </Button>
                </div>

                <div className="border border-red-200 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Reset All Generated Content</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Clear the content generation history. Generated content that hasn't been scheduled will be lost.
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Clear all generated content?')) {
                        dispatch({ type: 'SET_GENERATED_CONTENT', payload: [] });
                      }
                    }}
                    className="flex-shrink-0"
                  >
                    Clear Content
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <SavedBanner show={saved} />
    </div>
  );
}
