'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  BarChart3, 
  DownloadCloud, 
  Settings, 
  LogOut, 
  Activity, 
  Globe 
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Navigation Options
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Export Center', path: '/export', icon: DownloadCloud },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <aside className={`w-64 h-screen fixed left-0 top-0 z-30 glass-panel flex flex-col justify-between py-6 px-4 ${className}`}>
      {/* Brand Header */}
      <div className="flex flex-col">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg bg-gradient-to-r from-white via-indigo-200 to-purple-400 bg-clip-text text-transparent tracking-wider">
              ZEBVO
            </h1>
            <p className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">
              NLP Scraper
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-white/5 my-6 mx-3" />

        {/* Navigation Feed */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative group overflow-hidden ${
                  isActive
                    ? 'text-white bg-indigo-600/15 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.08)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full" />
                )}

                <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-105 ${
                  isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'
                }`} />
                
                <span>{item.name}</span>
                
                {/* Hover Glow Dot */}
                <span className="absolute right-4 w-1.5 h-1.5 rounded-full bg-indigo-400 opacity-0 transition-opacity duration-300 group-hover:opacity-40" />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile & Logout */}
      <div className="flex flex-col gap-4">
        {/* Connection Status Card */}
        <div className="p-3 bg-slate-950/45 rounded-xl border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-[11px] text-slate-400 font-semibold">Live Monitor</span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-ping" />
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-white/5 mx-3" />

        {/* Logout Actions */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-300 group cursor-pointer"
        >
          <LogOut className="w-5 h-5 text-rose-400 transition-transform duration-300 group-hover:translate-x-0.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
