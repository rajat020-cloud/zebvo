'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Activity } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex flex-col flex-1 h-screen w-screen items-center justify-center bg-[#07080e] text-[#f8fafc]">
      <div className="flex flex-col items-center gap-4">
        {/* Animated Loading Rings */}
        <div className="p-4 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.25)] animate-pulse">
          <Activity className="w-8 h-8 animate-spin" style={{ animationDuration: '4s' }} />
        </div>
        <div className="flex flex-col items-center">
          <h1 className="font-extrabold text-xl bg-gradient-to-r from-white via-indigo-200 to-purple-400 bg-clip-text text-transparent tracking-widest">
            ZEBVO MONITOR
          </h1>
          <p className="text-[10px] text-indigo-400 font-bold tracking-wider uppercase mt-1">
            Loading System Environment...
          </p>
        </div>
      </div>
    </div>
  );
}
