'use client';

import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  Search, 
  Database, 
  ShieldCheck 
} from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [username, setUsername] = useState('Admin');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.username) {
            setUsername(parsed.username);
          }
        } catch (_) {}
      }
    }
  }, []);

  // Format Page Name Title
  const getPageTitle = () => {
    switch (pathname) {
      case '/dashboard':
        return 'Monitoring Feed';
      case '/analytics':
        return 'Analytics Overview';
      case '/export':
        return 'Export Center';
      case '/settings':
        return 'Control Panel';
      default:
        return 'Intelligence Hub';
    }
  };

  return (
    <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-20 bg-slate-950/45 backdrop-blur-md">
      {/* View Header */}
      <div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent tracking-wide">
          {getPageTitle()}
        </h2>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">
          Real-time passport mentions & NLP insights
        </p>
      </div>

      {/* Global Controls & Status */}
      <div className="flex items-center gap-6">
        {/* System Health Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-indigo-600/10 border border-indigo-500/20 rounded-full">
          <Database className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
            DB Pool Connected
          </span>
        </div>

        {/* Notifications */}
        <button className="p-2 bg-slate-900 border border-white/5 rounded-xl text-slate-400 hover:text-slate-200 transition-colors relative cursor-pointer">
          <Bell className="w-4 h-4" />
          {/* Unread dot */}
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
        </button>

        {/* Vertical Line Divider */}
        <div className="h-6 w-[1px] bg-white/10" />

        {/* User Card Pill */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-semibold text-white leading-tight">
              {username.charAt(0).toUpperCase() + username.slice(1)}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-indigo-400" />
              <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase leading-none">
                System Admin
              </span>
            </div>
          </div>
          
          {/* Avatar Graphic */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 border border-indigo-500/30 flex items-center justify-center font-extrabold text-white text-base shadow-[0_0_15px_rgba(99,102,241,0.25)] relative group cursor-pointer overflow-hidden">
            {username.charAt(0).toUpperCase()}
            {/* Gloss hover overlay */}
            <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
      </div>
    </header>
  );
}
