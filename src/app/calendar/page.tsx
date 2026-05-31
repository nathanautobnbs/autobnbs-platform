'use client';

import { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, CalendarDays, List, Instagram,
  Facebook, Linkedin, LayoutGrid,
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, parseISO, addMonths,
  subMonths, isToday,
} from 'date-fns';
import { useAppState, useAppDispatch } from '@/lib/store';
import { Post, Platform } from '@/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { getPlatformColors, getStatusConfig, truncateText } from '@/lib/utils';
import { PLATFORM_CONFIG } from '@/lib/config';

const PlatformIcon: Record<Platform, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  tiktok: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={12} height={12}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.54V6.77a4.85 4.85 0 01-1.07-.08z" />
    </svg>
  ),
  buffer: () => <span className="text-xs font-bold">B</span>,
};

function PostDot({ post }: { post: Post }) {
  const colors = getPlatformColors(post.platform);
  const Icon = PlatformIcon[post.platform];
  return (
    <div
      className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-white text-xs ${colors.bgColor} truncate`}
      title={post.caption.slice(0, 60)}
    >
      <Icon />
      <span className="truncate hidden sm:block max-w-[80px]">
        {post.platform}
      </span>
    </div>
  );
}

function ListPostRow({ post, onClick }: { post: Post; onClick: () => void }) {
  const colors = getPlatformColors(post.platform);
  const statusConfig = getStatusConfig(post.status);
  const Icon = PlatformIcon[post.platform];
  const date = post.scheduledAt ?? post.publishedAt ?? post.createdAt;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors text-left group"
    >
      <div className={`w-10 h-10 rounded-xl ${colors.bgColor} flex items-center justify-center text-white flex-shrink-0 mt-0.5`}>
        <Icon />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 leading-snug">
          {truncateText(post.caption.replace(/\n/g, ' '), 100)}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
          <span className="text-xs text-gray-400">{colors.label}</span>
          <span className="text-xs text-gray-400">{format(parseISO(date), 'MMM d, h:mm a')}</span>
        </div>
      </div>
      {post.engagement && (
        <div className="text-right flex-shrink-0 text-xs text-gray-500">
          <p className="font-semibold text-gray-800">{post.engagement.likes}</p>
          <p>likes</p>
        </div>
      )}
    </button>
  );
}

export default function CalendarPage() {
  const { posts } = useAppState();
  const dispatch = useAppDispatch();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all');

  const filteredPosts = useMemo(() =>
    filterPlatform === 'all'
      ? posts
      : posts.filter((p) => p.platform === filterPlatform),
  [posts, filterPlatform]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getPostsForDay = (day: Date) =>
    filteredPosts.filter((post) => {
      const date = post.scheduledAt ?? post.publishedAt;
      if (!date) return false;
      return isSameDay(parseISO(date), day);
    });

  const selectedDayPosts = selectedDay ? getPostsForDay(selectedDay) : [];

  const handleReschedule = (post: Post, newDate: string) => {
    dispatch({
      type: 'UPDATE_POST',
      payload: { ...post, scheduledAt: new Date(newDate).toISOString() },
    });
  };

  const sortedListPosts = [...filteredPosts].sort((a, b) => {
    const dateA = a.scheduledAt ?? a.publishedAt ?? a.createdAt;
    const dateB = b.scheduledAt ?? b.publishedAt ?? b.createdAt;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="text-green-600" size={24} />
            Content Calendar
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {filteredPosts.length} posts across all platforms
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                view === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutGrid size={14} /> Calendar
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                view === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List size={14} /> List
            </button>
          </div>
        </div>
      </div>

      {/* Platform Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterPlatform('all')}
          className={`px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${
            filterPlatform === 'all'
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
          }`}
        >
          All Platforms
        </button>
        {(['instagram', 'facebook', 'tiktok', 'linkedin'] as Platform[]).map((platform) => {
          const cfg = PLATFORM_CONFIG[platform];
          const Icon = PlatformIcon[platform];
          const isActive = filterPlatform === platform;
          return (
            <button
              key={platform}
              onClick={() => setFilterPlatform(platform)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${
                isActive
                  ? `${cfg.bgColor} text-white border-transparent`
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon /> {cfg.label}
            </button>
          );
        })}
      </div>

      {view === 'calendar' ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 text-lg">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Day Labels */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="px-2 py-2.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 divide-x divide-gray-50">
            {calendarDays.map((day, idx) => {
              const dayPosts = getPostsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
              const isTodayDate = isToday(day);

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`min-h-[90px] p-2 border-b border-gray-50 text-left transition-colors ${
                    isSelected
                      ? 'bg-blue-50'
                      : isCurrentMonth
                      ? 'hover:bg-gray-50'
                      : 'bg-gray-50/50'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium mb-1 ${
                      isTodayDate
                        ? 'bg-blue-600 text-white'
                        : isCurrentMonth
                        ? 'text-gray-700'
                        : 'text-gray-300'
                    }`}
                  >
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5">
                    {dayPosts.slice(0, 3).map((post) => (
                      <PostDot key={post.id} post={post} />
                    ))}
                    {dayPosts.length > 3 && (
                      <span className="text-xs text-gray-400 pl-1">
                        +{dayPosts.length - 3} more
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="px-6 py-3 border-t border-gray-100 flex flex-wrap gap-4">
            {(['instagram', 'facebook', 'tiktok', 'linkedin'] as Platform[]).map((p) => {
              const cfg = PLATFORM_CONFIG[p];
              return (
                <div key={p} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <div className={`w-2.5 h-2.5 rounded-sm ${cfg.bgColor}`} />
                  {cfg.label}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">All Posts</h2>
            <p className="text-sm text-gray-400 mt-0.5">Sorted by most recent first</p>
          </div>
          <div className="divide-y divide-gray-50 px-2">
            {sortedListPosts.length > 0 ? (
              sortedListPosts.map((post) => (
                <ListPostRow
                  key={post.id}
                  post={post}
                  onClick={() => setSelectedPost(post)}
                />
              ))
            ) : (
              <div className="text-center py-16">
                <CalendarDays size={36} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No posts yet. Generate some content first!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Day Posts Panel (when day is selected in calendar view) */}
      {selectedDay && selectedDayPosts.length > 0 && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">
                {format(selectedDay, 'EEEE, MMMM d')}
              </h3>
              <p className="text-sm text-gray-400">{selectedDayPosts.length} post{selectedDayPosts.length !== 1 ? 's' : ''} scheduled</p>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Close
            </button>
          </div>
          <div className="divide-y divide-gray-50 px-2">
            {selectedDayPosts.map((post) => (
              <ListPostRow
                key={post.id}
                post={post}
                onClick={() => setSelectedPost(post)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      <Modal
        open={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        title="Post Details"
        size="lg"
      >
        {selectedPost && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              {(() => {
                const cfg = getPlatformColors(selectedPost.platform);
                const Icon = PlatformIcon[selectedPost.platform];
                const statusCfg = getStatusConfig(selectedPost.status);
                return (
                  <>
                    <div className={`w-10 h-10 rounded-xl ${cfg.bgColor} flex items-center justify-center text-white`}>
                      <Icon />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{cfg.label}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedPost.caption}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {selectedPost.hashtags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-md font-medium">
                  {tag}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {selectedPost.scheduledAt && (
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <p className="text-xs text-blue-500 font-medium mb-0.5">Scheduled For</p>
                  <p className="font-semibold text-blue-800">
                    {format(parseISO(selectedPost.scheduledAt), 'MMM d, h:mm a')}
                  </p>
                </div>
              )}
              {selectedPost.publishedAt && (
                <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                  <p className="text-xs text-green-500 font-medium mb-0.5">Published At</p>
                  <p className="font-semibold text-green-800">
                    {format(parseISO(selectedPost.publishedAt), 'MMM d, h:mm a')}
                  </p>
                </div>
              )}
            </div>

            {selectedPost.engagement && (
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Likes', value: selectedPost.engagement.likes },
                  { label: 'Comments', value: selectedPost.engagement.comments },
                  { label: 'Shares', value: selectedPost.engagement.shares },
                  { label: 'Reach', value: selectedPost.engagement.reach },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                    <p className="font-bold text-gray-900">{value.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {selectedPost.status === 'scheduled' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Reschedule
                </label>
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    defaultValue={selectedPost.scheduledAt?.slice(0, 16)}
                    onChange={(e) => handleReschedule(selectedPost, e.target.value)}
                    className="flex-1 h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
