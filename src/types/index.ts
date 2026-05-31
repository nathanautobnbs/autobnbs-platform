export type Platform = 'instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'buffer';
export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';
export type ToneOfVoice = 'professional' | 'casual' | 'inspirational' | 'educational';
export type ContentPillar =
  | 'airbnb-tips'
  | 'property-management'
  | 'passive-income'
  | 'success-stories'
  | 'travel-lifestyle'
  | 'market-insights';

export interface Engagement {
  likes: number;
  comments: number;
  shares: number;
  reach: number;
}

export interface Post {
  id: string;
  caption: string;
  hashtags: string[];
  imageDescription: string;
  imageUrl?: string;
  platform: Platform;
  status: PostStatus;
  scheduledAt?: string;
  publishedAt?: string;
  engagement?: Engagement;
  businessName: string;
  contentPillar: string;
  tone: ToneOfVoice;
  createdAt: string;
}

export type AdLayout = 'full-bleed' | 'bottom-bar' | 'left-aligned';
export type AdSize = 'square' | 'story';

export interface VisualAd {
  unsplashImage: UnsplashImage;
  layout: AdLayout;
  dataUrl: string | null;
}

export interface GeneratedContent {
  id: string;
  caption: string;
  hashtags: string[];
  imageDescription: string;
  platform: Platform;
  contentPillar: string;
  approved: boolean;
  visualAd?: VisualAd;
}

export interface PlatformConnection {
  platform: Platform;
  connected: boolean;
  lastSync?: string;
  username?: string;
  pageId?: string;
}

export interface UnsplashImage {
  id: string;
  url: string;
  thumbUrl: string;
  description: string;
  authorName: string;
  authorUrl: string;
  downloadUrl: string;
  width: number;
  height: number;
}

export interface BusinessSettings {
  name: string;
  industry: string;
  targetAudience: string;
  website: string;
  email: string;
}

export interface ContentPreferences {
  defaultTone: ToneOfVoice;
  defaultPlatforms: Platform[];
  postingFrequency: 'daily' | 'weekly' | 'custom';
  preferredTimes: string[];
  defaultContentPillars: ContentPillar[];
}

export interface NotificationSettings {
  emailScheduledPosts: boolean;
  emailFailedPosts: boolean;
  weeklyPerformanceSummary: boolean;
  notificationEmail: string;
}

export interface ApiKeys {
  claude: string;
  unsplash: string;
  buffer: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  tiktok: string;
}

export interface AppSettings {
  business: BusinessSettings;
  contentPreferences: ContentPreferences;
  notifications: NotificationSettings;
  apiKeys: ApiKeys;
}

export interface DayAnalytics {
  date: string;
  count: number;
}

export interface AppState {
  posts: Post[];
  generatedContent: GeneratedContent[];
  platformConnections: PlatformConnection[];
  settings: AppSettings;
  isGenerating: boolean;
  selectedImage: UnsplashImage | null;
}

export type AppAction =
  | { type: 'SET_POSTS'; payload: Post[] }
  | { type: 'ADD_POST'; payload: Post }
  | { type: 'UPDATE_POST'; payload: Post }
  | { type: 'DELETE_POST'; payload: string }
  | { type: 'SET_GENERATED_CONTENT'; payload: GeneratedContent[] }
  | { type: 'ADD_GENERATED_CONTENT'; payload: GeneratedContent[] }
  | { type: 'UPDATE_GENERATED_CONTENT'; payload: GeneratedContent }
  | { type: 'SET_IS_GENERATING'; payload: boolean }
  | { type: 'SET_PLATFORM_CONNECTIONS'; payload: PlatformConnection[] }
  | { type: 'UPDATE_PLATFORM_CONNECTION'; payload: PlatformConnection }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_SELECTED_IMAGE'; payload: UnsplashImage | null };
