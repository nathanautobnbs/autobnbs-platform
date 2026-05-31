'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, Images, Upload, X, Check, ExternalLink,
  Grid3X3, ChevronDown, AlertCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useAppDispatch, useAppState } from '@/lib/store';
import { UnsplashImage } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { IMAGE_CATEGORIES } from '@/lib/config';

const UNSPLASH_API = 'https://api.unsplash.com';
const ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

// Trigger the Unsplash download endpoint — required by API guidelines
async function triggerUnsplashDownload(downloadUrl: string) {
  if (!ACCESS_KEY || !downloadUrl) return;
  try {
    await fetch(`${downloadUrl}?client_id=${ACCESS_KEY}`);
  } catch {
    // Non-critical — don't surface this error to the user
  }
}

interface RawUnsplashPhoto {
  id: string;
  urls: { regular: string; small: string };
  description: string | null;
  alt_description: string | null;
  user: { name: string; username: string };
  links: { download_location: string };
  width: number;
  height: number;
}

async function searchUnsplash(
  query: string,
  page: number
): Promise<{ images: UnsplashImage[]; total: number }> {
  const url =
    `${UNSPLASH_API}/search/photos` +
    `?query=${encodeURIComponent(query)}` +
    `&page=${page}` +
    `&per_page=20` +
    `&orientation=landscape` +
    `&content_filter=high`;

  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Unsplash error ${res.status}: ${text}`);
  }

  const data: { results: RawUnsplashPhoto[]; total: number } = await res.json();

  const images: UnsplashImage[] = data.results.map((photo) => ({
    id: photo.id,
    url: photo.urls.regular,
    thumbUrl: photo.urls.small,
    description: photo.description ?? photo.alt_description ?? 'Photo from Unsplash',
    authorName: photo.user.name,
    authorUrl: `https://unsplash.com/@${photo.user.username}?utm_source=autobnbs&utm_medium=referral`,
    downloadUrl: photo.links.download_location,
    width: photo.width,
    height: photo.height,
  }));

  return { images, total: data.total };
}

// Skeleton card for the loading state
function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-100">
      <div className="aspect-video shimmer" />
      <div className="p-2 space-y-1.5">
        <div className="h-2.5 w-3/4 shimmer rounded" />
        <div className="h-2 w-1/2 shimmer rounded" />
      </div>
    </div>
  );
}

// Single image card
interface ImageCardProps {
  image: UnsplashImage;
  isSelected: boolean;
  onSelect: (image: UnsplashImage) => void;
  onPreview: (image: UnsplashImage) => void;
}

function ImageCard({ image, isSelected, onSelect, onPreview }: ImageCardProps) {
  return (
    <div
      className={`group rounded-xl overflow-hidden border-2 transition-all duration-150 bg-white shadow-sm card-hover ${
        isSelected
          ? 'border-orange-500 shadow-orange-100 shadow-md'
          : 'border-transparent hover:border-orange-300'
      }`}
    >
      {/* Photo */}
      <div className="aspect-video relative bg-gray-100 overflow-hidden">
        <Image
          src={image.thumbUrl}
          alt={image.description}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized
        />

        {/* Hover overlay with action buttons */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-all duration-200 flex items-center justify-center gap-2">
          <button
            onClick={() => onPreview(image)}
            className="opacity-0 group-hover:opacity-100 transition-all duration-150 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 active:scale-95"
            title="Preview full size"
          >
            <ExternalLink size={14} className="text-gray-700" />
          </button>
          <button
            onClick={() => onSelect(image)}
            className="opacity-0 group-hover:opacity-100 transition-all duration-150 flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg shadow-lg active:scale-95"
          >
            <Check size={12} />
            Use This Image
          </button>
        </div>

        {/* Selected badge */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
            <Check size={14} className="text-white" />
          </div>
        )}
      </div>

      {/* Attribution — required by Unsplash API guidelines */}
      <div className="px-2.5 py-2">
        <p className="text-xs text-gray-500 truncate leading-snug">
          Photo by{' '}
          <a
            href={image.authorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-700 hover:text-orange-600 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {image.authorName}
          </a>{' '}
          on{' '}
          <a
            href="https://unsplash.com?utm_source=autobnbs&utm_medium=referral"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-700 hover:text-orange-600 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Unsplash
          </a>
        </p>
      </div>
    </div>
  );
}

type Tab = 'search' | 'uploads';

export default function ImageLibraryPage() {
  const dispatch = useAppDispatch();
  const { selectedImage } = useAppState();

  const [tab, setTab] = useState<Tab>('search');
  const [inputValue, setInputValue] = useState('airbnb property rental');
  const [committedQuery, setCommittedQuery] = useState('airbnb property rental');
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('property');
  const [previewImage, setPreviewImage] = useState<UnsplashImage | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(selectedImage?.id ?? null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch on query/page change
  const fetchImages = useCallback(async (query: string, pageNum: number, append: boolean) => {
    if (!query.trim()) return;

    if (!ACCESS_KEY) {
      setError('Unsplash API key is not configured. Add NEXT_PUBLIC_UNSPLASH_ACCESS_KEY to your .env.local file.');
      return;
    }

    append ? setIsLoadingMore(true) : setIsLoading(true);
    setError(null);

    try {
      const { images: fetched, total } = await searchUnsplash(query, pageNum);
      setTotalResults(total);
      setImages((prev) => (append ? [...prev, ...fetched] : fetched));
      setHasMore(fetched.length === 20);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images. Please try again.');
      if (!append) setImages([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchImages(committedQuery, 1, false);
  }, [committedQuery, fetchImages]);

  // Debounced search as the user types
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setCommittedQuery(val);
    }, 500);
  };

  const handleCategoryClick = (cat: (typeof IMAGE_CATEGORIES)[0]) => {
    setSelectedCategory(cat.id);
    setInputValue(cat.query);
    setPage(1);
    setCommittedQuery(cat.query);
  };

  const handleSelectImage = useCallback(async (image: UnsplashImage) => {
    setSelectedId(image.id);
    dispatch({ type: 'SET_SELECTED_IMAGE', payload: image });
    // Required by Unsplash API guidelines — register the download
    await triggerUnsplashDownload(image.downloadUrl);
  }, [dispatch]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchImages(committedQuery, next, true);
  };

  const handleClearSelection = () => {
    dispatch({ type: 'SET_SELECTED_IMAGE', payload: null });
    setSelectedId(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Images className="text-orange-500" size={24} />
            Image Library
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Search millions of professional photos from Unsplash — free to use for your posts
          </p>
        </div>

        {selectedImage && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
            <div className="relative w-10 h-7 rounded-md overflow-hidden flex-shrink-0 border border-green-200">
              <Image
                src={selectedImage.thumbUrl}
                alt={selectedImage.description}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-green-800">Image selected</p>
              <p className="text-xs text-green-600 truncate max-w-[140px]">
                by {selectedImage.authorName}
              </p>
            </div>
            <button
              onClick={handleClearSelection}
              className="text-green-400 hover:text-green-600 ml-1 flex-shrink-0 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Tab Toggle */}
      <div className="flex bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab('search')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'search'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Search size={14} /> Search Unsplash
        </button>
        <button
          onClick={() => setTab('uploads')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'uploads'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Upload size={14} /> My Uploads
        </button>
      </div>

      {tab === 'search' && (
        <>
          {/* Search Bar + Category Pills */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Search — e.g. luxury apartment, Airbnb interior, passive income lifestyle..."
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
              />
              {isLoading && !images.length && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
              )}
              {inputValue && !isLoading && (
                <button
                  onClick={() => {
                    setInputValue('');
                    setCommittedQuery('');
                    setImages([]);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              {IMAGE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* API key missing warning */}
          {!ACCESS_KEY && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <AlertCircle size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-800">
                <span className="font-semibold">Unsplash API key not found. </span>
                Add <code className="bg-orange-100 px-1 py-0.5 rounded text-xs font-mono">
                  NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
                </code> to your <code className="bg-orange-100 px-1 py-0.5 rounded text-xs font-mono">.env.local</code> file and restart the server.
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">Failed to load images</p>
                <p className="text-sm text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Result count */}
          {!isLoading && !error && images.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-800">{images.length}</span> of{' '}
                <span className="font-semibold text-gray-800">
                  {totalResults.toLocaleString()}
                </span>{' '}
                results for{' '}
                <span className="font-semibold text-orange-600">"{committedQuery}"</span>
              </p>
              <p className="text-xs text-gray-400">
                Photos from{' '}
                <a
                  href="https://unsplash.com?utm_source=autobnbs&utm_medium=referral"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-600"
                >
                  Unsplash
                </a>
              </p>
            </div>
          )}

          {/* Loading skeleton grid */}
          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Image grid */}
          {!isLoading && images.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {images.map((image) => (
                  <ImageCard
                    key={image.id}
                    image={image}
                    isSelected={selectedId === image.id}
                    onSelect={handleSelectImage}
                    onPreview={setPreviewImage}
                  />
                ))}
              </div>

              {/* Load more */}
              {hasMore && (
                <div className="text-center pt-2">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    loading={isLoadingMore}
                    leftIcon={<ChevronDown size={14} />}
                    className="min-w-[160px]"
                  >
                    {isLoadingMore ? 'Loading…' : 'Load More Photos'}
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Empty state */}
          {!isLoading && !error && images.length === 0 && committedQuery && ACCESS_KEY && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-20 text-center">
              <Images size={40} className="text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">No photos found</h3>
              <p className="text-sm text-gray-400 max-w-xs mx-auto">
                No results for <span className="font-semibold">"{committedQuery}"</span>. Try a
                different keyword or choose a category above.
              </p>
            </div>
          )}

          {/* Initial empty state (no search yet) */}
          {!isLoading && !error && images.length === 0 && !committedQuery && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-20 text-center">
              <Search size={40} className="text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">Search for a photo</h3>
              <p className="text-sm text-gray-400">
                Type a keyword above or select a category to browse photos
              </p>
            </div>
          )}
        </>
      )}

      {/* My Uploads tab */}
      {tab === 'uploads' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-16 text-center hover:border-orange-300 transition-colors cursor-pointer group">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-100 transition-colors">
                <Upload size={28} className="text-orange-400" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Upload Your Images</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto mb-4">
                Drag and drop your property photos, brand images, or any custom visuals you want
                to use in your posts.
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Supported formats: JPG, PNG, WebP · Max 10MB per image
              </p>
              <Button
                variant="outline"
                leftIcon={<Upload size={14} />}
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                Choose Files to Upload
              </Button>
              <p className="text-xs text-gray-400 mt-3">
                Upload storage coming soon — connect cloud storage to enable this feature
              </p>
            </div>

            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {IMAGE_CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100"
                >
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                    <Grid3X3 size={14} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{cat.label}</p>
                    <p className="text-xs text-gray-400">0 images</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Full-size preview modal */}
      <Modal
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        title={previewImage?.description?.slice(0, 60) ?? 'Image Preview'}
        size="xl"
      >
        {previewImage && (
          <div className="p-4 space-y-4">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
              <Image
                src={previewImage.url}
                alt={previewImage.description}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 900px"
                unoptimized
              />
            </div>

            {/* Attribution in modal — Unsplash requirement */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm text-gray-600">
                  Photo by{' '}
                  <a
                    href={previewImage.authorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-gray-900 hover:text-orange-600 transition-colors"
                  >
                    {previewImage.authorName}
                  </a>{' '}
                  on{' '}
                  <a
                    href="https://unsplash.com?utm_source=autobnbs&utm_medium=referral"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-gray-900 hover:text-orange-600 transition-colors"
                  >
                    Unsplash
                  </a>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {previewImage.width.toLocaleString()} × {previewImage.height.toLocaleString()} px
                </p>
              </div>
              <Button
                size="lg"
                onClick={async () => {
                  await handleSelectImage(previewImage);
                  setPreviewImage(null);
                }}
                leftIcon={
                  selectedId === previewImage.id ? <Check size={16} /> : <Check size={16} />
                }
                className={
                  selectedId === previewImage.id
                    ? 'bg-green-600 hover:bg-green-700 border-green-600'
                    : 'bg-orange-500 hover:bg-orange-600 border-orange-500'
                }
              >
                {selectedId === previewImage.id ? 'Selected' : 'Use This Image'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
