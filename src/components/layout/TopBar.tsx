'use client';

import { Bell, Menu, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { useAppState } from '@/lib/store';

interface TopBarProps {
  onMobileMenuToggle: () => void;
}

export default function TopBar({ onMobileMenuToggle }: TopBarProps) {
  const { posts } = useAppState();
  const [showNotifications, setShowNotifications] = useState(false);

  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  const recentNotifications = [
    {
      id: 1,
      message: '3 posts scheduled for today',
      time: '2 minutes ago',
      color: 'bg-blue-500',
    },
    {
      id: 2,
      message: 'Instagram post published successfully',
      time: '1 hour ago',
      color: 'bg-green-500',
    },
    {
      id: 3,
      message: 'Facebook post published successfully',
      time: '3 hours ago',
      color: 'bg-blue-500',
    },
    {
      id: 4,
      message: 'New content generated — 5 posts ready',
      time: 'Yesterday',
      color: 'bg-purple-500',
    },
  ];

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 lg:px-6 sticky top-0 z-20">
      {/* Mobile menu button */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500 mr-3"
      >
        <Menu size={20} />
      </button>

      {/* Business Name + Date */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="font-bold text-gray-900 text-base leading-tight">AutoBNBs</h1>
          <p className="text-xs text-gray-400 hidden sm:block">{today}</p>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="font-semibold text-gray-900 text-sm">Notifications</span>
                  <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">
                    Mark all read
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {recentNotifications.map((n) => (
                    <div
                      key={n.id}
                      className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.color}`}
                        />
                        <div>
                          <p className="text-sm text-gray-700">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-gray-100">
                  <button className="text-xs text-gray-500 hover:text-gray-700 w-full text-center">
                    View all notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User avatar */}
        <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin</span>
          <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
        </button>
      </div>
    </header>
  );
}
