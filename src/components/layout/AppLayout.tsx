'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <TopBar onMobileMenuToggle={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
