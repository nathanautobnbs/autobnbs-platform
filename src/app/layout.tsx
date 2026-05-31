import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store';
import AppLayout from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'AutoBNBs — Social Media Automation Platform',
  description:
    'Automated social media content generation, scheduling, and publishing for short-term rental property managers.',
  keywords: 'Airbnb management, social media automation, property management, passive income',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-white text-gray-900 antialiased">
        <AppProvider>
          <AppLayout>{children}</AppLayout>
        </AppProvider>
      </body>
    </html>
  );
}
