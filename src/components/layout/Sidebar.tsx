'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  CalendarDays,
  Images,
  Link2,
  BarChart3,
  Settings,
  Home,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  accent: string;
  activeAccent: string;
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    accent: 'text-gray-500',
    activeAccent: 'text-blue-600 bg-blue-50',
  },
  {
    href: '/content-generator',
    label: 'Content Generator',
    icon: Sparkles,
    accent: 'text-gray-500',
    activeAccent: 'text-purple-600 bg-purple-50',
  },
  {
    href: '/calendar',
    label: 'Content Calendar',
    icon: CalendarDays,
    accent: 'text-gray-500',
    activeAccent: 'text-green-600 bg-green-50',
  },
  {
    href: '/image-library',
    label: 'Image Library',
    icon: Images,
    accent: 'text-gray-500',
    activeAccent: 'text-orange-600 bg-orange-50',
  },
  {
    href: '/platforms',
    label: 'Platforms',
    icon: Link2,
    accent: 'text-gray-500',
    activeAccent: 'text-red-600 bg-red-50',
  },
  {
    href: '/analytics',
    label: 'Analytics',
    icon: BarChart3,
    accent: 'text-gray-500',
    activeAccent: 'text-yellow-600 bg-yellow-50',
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    accent: 'text-gray-500',
    activeAccent: 'text-gray-600 bg-gray-100',
  },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Home size={16} className="text-white" />
        </div>
        <div>
          <span className="font-bold text-gray-900 text-lg leading-none">AutoBNBs</span>
          <p className="text-xs text-gray-400 mt-0.5">Content Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
          Main Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                isActive
                  ? item.activeAccent + ' font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon
                size={18}
                className={cn(
                  'flex-shrink-0 transition-colors',
                  isActive ? '' : 'text-gray-400 group-hover:text-gray-600'
                )}
              />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-current opacity-70" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-100">
          <p className="text-xs font-semibold text-gray-700 mb-1">Pro Tip</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Generate content daily to maintain consistent engagement across all platforms.
          </p>
        </div>
        <p className="text-center text-xs text-gray-400 mt-3">v1.0.0 · AutoBNBs Platform</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen bg-white border-r border-gray-100 fixed left-0 top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed left-0 top-0 h-full w-72 bg-white z-50 shadow-2xl transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-0">
          <span />
          <button
            onClick={onMobileClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
}
