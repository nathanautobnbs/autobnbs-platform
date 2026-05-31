'use client';

import { useRouter } from 'next/navigation';
import {
  CalendarClock,
  CheckCircle2,
  Link2,
  TrendingUp,
  Sparkles,
  Instagram,
  Facebook,
  Linkedin,
  ArrowUpRight,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAppState } from '@/lib/store';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  getTodayScheduledCount,
  getWeekPublishedCount,
  getAverageEngagementRate,
  getConnectedPlatformCount,
  getPlatformColors,
  getStatusConfig,
  formatRelativeTime,
  truncateText,
} from '@/lib/utils';
import { Platform, Post } from '@/types';
import { PLATFORM_CONFIG } from '@/lib/config';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
  iconBg: string;
  iconColor: string;
  change?: string;
}

function StatCard({ label, value, icon: Icon, accent, iconBg, iconColor, change }: StatCardProps) {
  return (
    <div className={`bg-white rounded-2xl border-2 ${accent} p-5 card-hover`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1.5">{value}</p>
          {change && (
            <p className="text-xs text-green-600 font-medium mt-1.5 flex items-center gap-1">
              <ArrowUpRight size={12} />
              {change}
            </p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon size={22} className={iconColor} />
        </div>
      </div>
    </div>
  );
}

const platformIcons: Record<Platform, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  tiktok: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.54V6.77a4.85 4.85 0 01-1.07-.08z" />
    </svg>
  ),
  buffer: () => <span className="text-xs font-bold">B</span>,
};

function PlatformStatusRow({ platform, connected }: { platform: Platform; connected: boolean }) {
  const config = PLATFORM_CONFIG[platform];
  if (!config) return null;
  const Icon = platformIcons[platform] ?? (() => null);

  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors group">
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${platform === 'linkedin' ? '' : config.bgColor}`}
          style={platform === 'linkedin' ? { backgroundColor: '#0A66C2' } : undefined}
        >
          <Icon />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{config.label}</p>
          <p className={`text-xs ${connected ? 'text-green-600' : 'text-gray-400'}`}>
            {connected ? 'Connected' : 'Not connected'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div
          className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-green-500 animate-pulse-slow' : 'bg-gray-300'}`}
        />
        <ChevronRight
          size={14}
          className="text-gray-300 group-hover:text-gray-500 transition-colors"
        />
      </div>
    </div>
  );
}

function ActivityItem({ post }: { post: Post }) {
  const colors = getPlatformColors(post.platform);
  const statusConfig = getStatusConfig(post.status);
  const Icon = platformIcons[post.platform] ?? (() => null);

  return (
    <div className="flex items-start gap-3 py-3 px-3 rounded-xl hover:bg-gray-50 transition-colors group">
      <div
        className={`w-9 h-9 rounded-xl ${colors.bgColor} flex items-center justify-center text-white flex-shrink-0 mt-0.5`}
      >
        <Icon />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 leading-snug">
          {truncateText(post.caption.replace(/\n/g, ' '), 80)}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock size={10} />
            {post.publishedAt
              ? formatRelativeTime(post.publishedAt)
              : post.scheduledAt
              ? `Scheduled ${formatRelativeTime(post.scheduledAt)}`
              : formatRelativeTime(post.createdAt)}
          </span>
        </div>
      </div>
      {post.engagement && (
        <div className="text-right flex-shrink-0">
          <p className="text-xs font-semibold text-gray-800">{post.engagement.likes}</p>
          <p className="text-xs text-gray-400">likes</p>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { posts, platformConnections } = useAppState();

  const todayScheduled = getTodayScheduledCount(posts);
  const weekPublished = getWeekPublishedCount(posts);
  const connectedCount = getConnectedPlatformCount(platformConnections);
  const avgEngagement = getAverageEngagementRate(posts);

  const recentPosts = posts
    .filter((p) => p.status === 'published' || p.status === 'scheduled')
    .slice(0, 5);

  const todayPosts = posts.filter((p) => {
    const date = p.scheduledAt ?? p.publishedAt;
    if (!date) return false;
    return (
      format(parseISO(date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {format(new Date(), "EEEE, MMMM d")} · Here's what's happening with AutoBNBs today
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => router.push('/content-generator')}
          leftIcon={<Sparkles size={18} />}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-md"
        >
          Generate Content Now
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Posts Scheduled Today"
          value={todayScheduled}
          icon={CalendarClock}
          accent="border-blue-100"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          change="2 more than yesterday"
        />
        <StatCard
          label="Published This Week"
          value={weekPublished}
          icon={CheckCircle2}
          accent="border-green-100"
          iconBg="bg-green-50"
          iconColor="text-green-600"
          change="+18% vs last week"
        />
        <StatCard
          label="Platforms Connected"
          value={`${connectedCount} / 5`}
          icon={Link2}
          accent="border-red-100"
          iconBg="bg-red-50"
          iconColor="text-red-600"
        />
        <StatCard
          label="Avg Engagement Rate"
          value={`${avgEngagement}%`}
          icon={TrendingUp}
          accent="border-yellow-100"
          iconBg="bg-yellow-50"
          iconColor="text-yellow-600"
          change="+1.2% this month"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Recent Activity</h2>
            <button
              onClick={() => router.push('/calendar')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View calendar <ChevronRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-gray-50 px-2">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => <ActivityItem key={post.id} post={post} />)
            ) : (
              <div className="text-center py-12">
                <Sparkles size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No posts yet. Generate your first batch!</p>
                <Button
                  size="sm"
                  className="mt-3"
                  onClick={() => router.push('/content-generator')}
                >
                  Generate Content
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Platform Status */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Platforms</h2>
              <button
                onClick={() => router.push('/platforms')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Manage
              </button>
            </div>
            <div className="p-2">
              {platformConnections.map((pc) => (
                <PlatformStatusRow
                  key={pc.platform}
                  platform={pc.platform}
                  connected={pc.connected}
                />
              ))}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Today's Schedule</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {format(new Date(), 'MMMM d, yyyy')}
              </p>
            </div>
            <div className="p-4">
              {todayPosts.length > 0 ? (
                <div className="space-y-3">
                  {todayPosts.map((post) => {
                    const colors = getPlatformColors(post.platform);
                    const time = post.scheduledAt
                      ? format(parseISO(post.scheduledAt), 'h:mm a')
                      : 'Anytime';
                    return (
                      <div key={post.id} className="flex items-center gap-3">
                        <div className={`w-1.5 h-12 rounded-full ${colors.bgColor}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800 capitalize">
                            {post.platform}
                          </p>
                          <p className="text-xs text-gray-400">{time}</p>
                        </div>
                        <Badge
                          className={getStatusConfig(post.status).color}
                        >
                          {getStatusConfig(post.status).label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CalendarClock size={28} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Nothing scheduled today yet</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3"
                    onClick={() => router.push('/content-generator')}
                  >
                    Schedule a Post
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Tip Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Ready to automate your content?</h3>
            <p className="text-blue-100 text-sm">
              Connect your social media platforms and let AutoBNBs handle everything — from AI-generated
              captions to automated posting across Instagram, Facebook, LinkedIn, and more.
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => router.push('/platforms')}
            className="bg-white text-blue-700 hover:bg-blue-50 border-0 font-bold flex-shrink-0"
          >
            Connect Platforms
          </Button>
        </div>
      </div>
    </div>
  );
}
