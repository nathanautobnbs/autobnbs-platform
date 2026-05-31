import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { Platform, Post, PostStatus } from '@/types';
import { PLATFORM_CONFIG } from './config';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  try {
    return format(parseISO(dateString), 'MMM d, yyyy');
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function getPlatformLabel(platform: Platform): string {
  return PLATFORM_CONFIG[platform]?.label ?? platform;
}

export function getPlatformColors(platform: Platform) {
  return PLATFORM_CONFIG[platform] ?? PLATFORM_CONFIG.instagram;
}

export function getStatusConfig(status: PostStatus): {
  label: string;
  color: string;
  dot: string;
} {
  const configs: Record<PostStatus, { label: string; color: string; dot: string }> = {
    scheduled: { label: 'Scheduled', color: 'text-blue-600 bg-blue-50 border-blue-200', dot: 'bg-blue-500' },
    published: { label: 'Published', color: 'text-green-600 bg-green-50 border-green-200', dot: 'bg-green-500' },
    draft: { label: 'Draft', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', dot: 'bg-yellow-500' },
    failed: { label: 'Failed', color: 'text-red-600 bg-red-50 border-red-200', dot: 'bg-red-500' },
  };
  return configs[status] ?? configs.draft;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function calculateEngagementRate(post: Post): number {
  if (!post.engagement) return 0;
  const { likes, comments, shares, reach } = post.engagement;
  if (reach === 0) return 0;
  return Math.round(((likes + comments + shares) / reach) * 100 * 10) / 10;
}

export function groupPostsByDate(posts: Post[]): Record<string, Post[]> {
  return posts.reduce((acc, post) => {
    const date = post.scheduledAt ?? post.publishedAt ?? post.createdAt;
    const key = format(parseISO(date), 'yyyy-MM-dd');
    if (!acc[key]) acc[key] = [];
    acc[key].push(post);
    return acc;
  }, {} as Record<string, Post[]>);
}

export function getTodayScheduledCount(posts: Post[]): number {
  const today = format(new Date(), 'yyyy-MM-dd');
  return posts.filter((p) => {
    const date = p.scheduledAt ?? p.publishedAt;
    if (!date) return false;
    return format(parseISO(date), 'yyyy-MM-dd') === today && p.status === 'scheduled';
  }).length;
}

export function getWeekPublishedCount(posts: Post[]): number {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return posts.filter((p) => {
    if (!p.publishedAt) return false;
    const published = parseISO(p.publishedAt);
    return published >= weekAgo && published <= now && p.status === 'published';
  }).length;
}

export function getAverageEngagementRate(posts: Post[]): number {
  const publishedWithEngagement = posts.filter(
    (p) => p.status === 'published' && p.engagement
  );
  if (publishedWithEngagement.length === 0) return 0;
  const total = publishedWithEngagement.reduce((sum, p) => sum + calculateEngagementRate(p), 0);
  return Math.round((total / publishedWithEngagement.length) * 10) / 10;
}

export function getConnectedPlatformCount(platforms: { connected: boolean }[]): number {
  return platforms.filter((p) => p.connected).length;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
