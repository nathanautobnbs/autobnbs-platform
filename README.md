# AutoBNBs Social Media Automation Platform

A production-ready AI-powered social media content automation platform for AutoBNBs — a short-term rental property management company. Generate, schedule, and publish content across Instagram, Facebook, LinkedIn, Twitter, and TikTok, all powered by Claude AI.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Claude AI** (Anthropic SDK) — content generation
- **Unsplash API** — image library
- **Recharts** — analytics charts
- **date-fns** — date utilities

## Features

- **Dashboard** — Overview of scheduled posts, platform status, engagement metrics
- **Content Generator** — AI-generated captions via Claude, platform-specific and on-brand
- **Content Calendar** — Monthly calendar view + list view, reschedule posts
- **Image Library** — Unsplash integration + upload tab
- **Platform Connections** — Connect Instagram, Facebook, LinkedIn, Twitter, TikTok, Buffer
- **Analytics** — Post performance, engagement charts, platform breakdown
- **Settings** — Business profile, content preferences, notifications

## Getting Started

### 1. Clone and install

```bash
cd autobnbs-platform
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in your API keys in `.env.local`:

| Variable | Source | Required for |
|----------|--------|-------------|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) | Content generation |
| `UNSPLASH_ACCESS_KEY` | [unsplash.com/developers](https://unsplash.com/developers) | Image search |
| `BUFFER_ACCESS_TOKEN` | [buffer.com/developers](https://buffer.com/developers) | Multi-platform scheduling |
| `INSTAGRAM_ACCESS_TOKEN` | Meta for Developers | Instagram publishing |
| `FACEBOOK_ACCESS_TOKEN` | Meta Graph Explorer | Facebook publishing |
| `LINKEDIN_ACCESS_TOKEN` | LinkedIn Developer portal | LinkedIn publishing |
| `TWITTER_API_KEY` | developer.twitter.com | Twitter publishing |

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Deploy to Vercel

```bash
npx vercel
```

Set all environment variables in the Vercel dashboard under Project Settings > Environment Variables.

## Platform Without API Keys

The platform is fully functional in demo mode without any API keys:

- **Content Generator** — Shows realistic demo content instead of live Claude generation
- **Image Library** — Shows placeholder images from picsum.photos
- **Analytics** — Shows realistic demo data
- **Calendar & Dashboard** — Fully functional with pre-loaded sample posts

## Automated Daily Content (Cron)

The platform includes a Vercel Cron Job configured in `vercel.json`:

```json
{
  "crons": [{ "path": "/api/cron/generate-daily", "schedule": "0 8 * * *" }]
}
```

This triggers daily at 8am UTC to generate and schedule fresh content automatically.
Add `CRON_SECRET` to your environment variables to secure the endpoint.

## Architecture

```
src/
├── app/
│   ├── page.tsx                    # Dashboard
│   ├── content-generator/page.tsx  # AI content generation
│   ├── calendar/page.tsx           # Content calendar
│   ├── image-library/page.tsx      # Image search + uploads
│   ├── platforms/page.tsx          # Platform connections + API keys
│   ├── analytics/page.tsx          # Post performance analytics
│   ├── settings/page.tsx           # Business + content settings
│   └── api/
│       ├── generate-content/       # Claude AI content generation
│       ├── unsplash/               # Unsplash image search
│       ├── schedule-post/          # Post scheduling + platform APIs
│       └── cron/                   # Daily auto-generation cron
├── components/
│   ├── layout/                     # Sidebar, TopBar, AppLayout
│   └── ui/                         # Button, Badge, Modal
├── lib/
│   ├── config.ts                   # Central platform configuration
│   ├── store.tsx                   # Global state (Context + localStorage)
│   └── utils.ts                    # Helper utilities
├── types/index.ts                  # TypeScript type definitions
└── data/                           # Demo JSON data (migrates to Supabase)
    ├── posts.json
    ├── analytics.json
    └── settings.json
```

## Future: Migrating to a Real Database

The JSON data files in `src/data/` are designed to be drop-in replaceable with Supabase or PostgreSQL.
Replace the JSON imports in `src/lib/store.tsx` with Supabase client calls using the same data shapes.

## Colour System

| Colour | Used for |
|--------|---------|
| Red | Platform connections, danger actions |
| Green | Published posts, success states |
| Blue | Dashboard stats, scheduled posts |
| Yellow | Analytics, warnings |
| Purple | Content generator, Instagram |
| Orange | Image library, Buffer |
