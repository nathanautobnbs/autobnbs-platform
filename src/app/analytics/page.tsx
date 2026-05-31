'use client';

import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import {
  BarChart3, TrendingUp, Star, Target, Filter, Instagram,
  Facebook, Linkedin, Twitter, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { format, parseISO, subDays, isAfter } from 'date-fns';
import { useAppState } from '@/lib/store';
import { Platform } from '@/types';
import Badge from '@/components/ui/Badge';
import analyticsData from '@/data/analytics.json';
import { getPlatformColors, calculateEngagementRate } from '@/lib/utils';
import { PLATFORM_CONFIG } from '@/lib/config';

const PlatformIcon: Record<Platform, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  twitter: Twitter,
  tiktok: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.54V6.77a4.85 4.85 0 01-1.07-.08z" />
    </svg>
  ),
  buffer: () => <span className="text-xs font-bold">B</span>,
};

const CHART_COLORS: Record<Platform, string> = {
  instagram: '#a855f7',
  facebook: '#3b82f6',
  linkedin: '#1d4ed8',
  twitter: '#111827',
  tiktok: '#111827',
  buffer: '#f97316',
};

interface OverviewCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  accent: string;
  iconBg: string;
  iconColor: string;
  change?: { value: string; positive: boolean };
}

function OverviewCard({ label, value, icon: Icon, accent, iconBg, iconColor, change }: OverviewCardProps) {
  return (
    <div className={`bg-white rounded-2xl border-2 ${accent} p-5 card-hover`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1.5">{value}</p>
          {change && (
            <p className={`text-xs font-medium mt-1.5 flex items-center gap-1 ${change.positive ? 'text-green-600' : 'text-red-500'}`}>
              {change.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {change.value}
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

type DateRange = '7d' | '30d' | '90d';
type PlatformFilter = Platform | 'all';

export default function AnalyticsPage() {
  const { posts } = useAppState();
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');

  const daysMap: Record<DateRange, number> = { '7d': 7, '30d': 30, '90d': 90 };

  const filteredPosts = useMemo(() => {
    const cutoff = subDays(new Date(), daysMap[dateRange]);
    return posts.filter((p) => {
      const date = p.publishedAt ?? p.scheduledAt ?? p.createdAt;
      const afterCutoff = isAfter(parseISO(date), cutoff);
      const matchesPlatform = platformFilter === 'all' || p.platform === platformFilter;
      return afterCutoff && matchesPlatform;
    });
  }, [posts, dateRange, platformFilter]);

  const publishedPosts = useMemo(
    () => filteredPosts.filter((p) => p.status === 'published'),
    [filteredPosts]
  );

  // Merge demo analytics data with real posts data
  const chartData = useMemo(() => {
    const days = daysMap[dateRange];
    return analyticsData.postsByDay.slice(-days).map((d) => ({
      date: format(parseISO(d.date), 'MMM d'),
      posts: d.count,
    }));
  }, [dateRange]);

  const platformBreakdown = useMemo(() => {
    return Object.entries(analyticsData.byPlatform).map(([platform, data]) => ({
      platform: platform as Platform,
      ...data,
    }));
  }, []);

  const contentTypeData = useMemo(() => {
    return Object.entries(analyticsData.byContentType).map(([type, data]) => ({
      name: type.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      posts: data.posts,
      engagement: data.avgEngagement,
    }));
  }, []);

  const postsWithEngagement = publishedPosts.filter((p) => p.engagement);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="text-yellow-500" size={24} />
            Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Performance overview — demo data shown until platforms are connected
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Date Range */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            {(['7d', '30d', '90d'] as DateRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  dateRange === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                {r === '7d' ? 'Last 7 days' : r === '30d' ? 'Last 30 days' : 'Last 90 days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Data Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800 flex items-center gap-2">
        <Target size={16} className="text-yellow-600 flex-shrink-0" />
        <span>
          Analytics display demo data to show the full layout. Connect your social platforms in{' '}
          <a href="/platforms" className="underline font-medium">Platform Settings</a>{' '}
          to populate with real performance data.
        </span>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCard
          label="Total Posts Published"
          value={analyticsData.overview.totalPostsPublished.toString()}
          icon={BarChart3}
          accent="border-blue-100"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          change={{ value: '+12 vs last period', positive: true }}
        />
        <OverviewCard
          label="Avg Engagement Rate"
          value={`${analyticsData.overview.avgEngagementRate}%`}
          icon={TrendingUp}
          accent="border-green-100"
          iconBg="bg-green-50"
          iconColor="text-green-600"
          change={{ value: '+1.2% this month', positive: true }}
        />
        <OverviewCard
          label="Best Performing Platform"
          value="Instagram"
          icon={Star}
          accent="border-purple-100"
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          change={{ value: '7.8% avg engagement', positive: true }}
        />
        <OverviewCard
          label="Best Content Type"
          value={analyticsData.overview.bestContentType}
          icon={Target}
          accent="border-orange-100"
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          change={{ value: '8.9% avg engagement', positive: true }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Posting Frequency */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-1">Posting Frequency</h2>
          <p className="text-xs text-gray-400 mb-4">Posts published per day (last {daysMap[dateRange]} days)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                interval={Math.floor(chartData.length / 6)}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                width={24}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="posts" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Posts" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement by Content Type */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-1">Engagement by Content Type</h2>
          <p className="text-xs text-gray-400 mb-4">Average engagement rate by content pillar</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={contentTypeData} barSize={10} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                width={90}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`${value}%`, 'Engagement']}
              />
              <Bar dataKey="engagement" fill="#a855f7" radius={[0, 4, 4, 0]} name="Avg Engagement %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Platform Breakdown</h2>
          <p className="text-xs text-gray-400 mt-0.5">Performance summary per platform</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {platformBreakdown.map(({ platform, posts: postCount, avgEngagement, totalReach }) => {
            const cfg = PLATFORM_CONFIG[platform as Platform];
            const Icon = PlatformIcon[platform as Platform] ?? (() => null);
            if (!cfg) return null;
            return (
              <div key={platform} className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg ${cfg.bgColor} flex items-center justify-center text-white`}>
                    <Icon />
                  </div>
                  <span className="font-semibold text-gray-800 text-sm">{cfg.label}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Posts</span>
                    <span className="font-semibold text-gray-900">{postCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Avg Engagement</span>
                    <span className="font-semibold text-green-600">{avgEngagement}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Reach</span>
                    <span className="font-semibold text-gray-900">{(totalReach / 1000).toFixed(1)}k</span>
                  </div>
                </div>
                {/* Mini engagement bar */}
                <div className="mt-3">
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div
                      className={`h-1.5 rounded-full ${cfg.bgColor}`}
                      style={{ width: `${Math.min((avgEngagement / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">Post Performance</h2>
            <p className="text-xs text-gray-400 mt-0.5">{postsWithEngagement.length} posts with engagement data</p>
          </div>
          {/* Platform filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value as PlatformFilter)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="tiktok">TikTok</option>
              <option value="linkedin">LinkedIn</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Post</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Platform</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Likes</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Comments</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reach</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {postsWithEngagement.length > 0 ? (
                postsWithEngagement.map((post) => {
                  const cfg = getPlatformColors(post.platform);
                  const Icon = PlatformIcon[post.platform];
                  const engRate = calculateEngagementRate(post);
                  const date = post.publishedAt ?? post.createdAt;
                  return (
                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-gray-700 max-w-xs truncate">{post.caption.split('\n')[0].slice(0, 60)}…</p>
                        <p className="text-xs text-gray-400 mt-0.5 capitalize">{post.contentPillar.replace(/-/g, ' ')}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-6 h-6 rounded-md ${cfg.bgColor} flex items-center justify-center text-white`}>
                            <Icon />
                          </div>
                          <span className={`text-xs font-medium ${cfg.textColor}`}>{cfg.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                        {format(parseISO(date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-gray-800">
                        {post.engagement!.likes.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-gray-800">
                        {post.engagement!.comments.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-right text-gray-600">
                        {post.engagement!.reach.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          engRate >= 7 ? 'bg-green-50 text-green-700' :
                          engRate >= 4 ? 'bg-yellow-50 text-yellow-700' :
                          'bg-gray-50 text-gray-600'
                        }`}>
                          {engRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                    No published posts with engagement data found for this period.
                    Connect platforms to start tracking real performance.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
