'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API, DashboardAnalytics } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Volume2, 
  Smile, 
  Trash2, 
  GitFork, 
  TrendingUp, 
  Users, 
  Award,
  Clock,
  Compass
} from 'lucide-react';

export default function Analytics() {
  const router = useRouter();
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth Guard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  // Load Analytics Data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await API.getAnalytics();
        setData(response);
      } catch (err) {
        console.error('Failed to load dashboard analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex bg-[#07080e] min-h-screen text-slate-100 overflow-hidden">
        <Sidebar />
        <div className="flex-1 pl-64 flex flex-col h-screen overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-8 flex flex-col justify-center items-center">
            <span className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-xs text-indigo-400 font-bold tracking-wider uppercase mt-4 animate-pulse">
              Aggregating NLP Metrics...
            </p>
          </main>
        </div>
      </div>
    );
  }

  // Sentiment donut colors
  const COLORS = ['#ef4444', '#64748b', '#10b981']; // Negative, Neutral, Positive order matching standard count groups

  return (
    <div className="flex bg-[#07080e] min-h-screen text-slate-100 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Workspace */}
      <div className="flex-1 pl-64 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <Navbar />

        {/* Scrollable Analytics Frame */}
        <main className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6">
          
          {/* 1. TOP METRICS CARDS GRID */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Mentions Ingested */}
            <div className="glass-card border border-white/5 rounded-3xl p-6 flex items-center justify-between shadow-lg hover:translate-y-[-2px] transition-all duration-300">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  Processed Mentions
                </span>
                <span className="text-3xl font-extrabold text-white mt-2">
                  {data.metrics.totalIngested}
                </span>
                <span className="text-[10px] text-indigo-400 font-bold uppercase mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +12.4% Ingestion Rate
                </span>
              </div>
              <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-2xl">
                <Volume2 className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            {/* Average Sentiment Rating */}
            <div className="glass-card border border-white/5 rounded-3xl p-6 flex items-center justify-between shadow-lg hover:translate-y-[-2px] transition-all duration-300">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  Net Sentiment
                </span>
                <span className="text-3xl font-extrabold text-white mt-2">
                  {data.metrics.averageSentiment > 0 ? '+' : ''}{data.metrics.averageSentiment.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                  Scale: -1.0 to +1.0
                </span>
              </div>
              {/* Sentiment Indicator Icon */}
              <div className={`p-4 rounded-2xl border ${
                data.metrics.averageSentiment < -0.1 
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}>
                <Smile className="w-6 h-6" />
              </div>
            </div>

            {/* Spam Filter Percentage */}
            <div className="glass-card border border-white/5 rounded-3xl p-6 flex items-center justify-between shadow-lg hover:translate-y-[-2px] transition-all duration-300">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  Spam Filtered
                </span>
                <span className="text-3xl font-extrabold text-white mt-2">
                  {data.metrics.spamPercent.toFixed(1)}%
                </span>
                <span className="text-[10px] text-amber-400 font-bold uppercase mt-1">
                  {data.metrics.spamCount} Ingested bot spam
                </span>
              </div>
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
            </div>

            {/* Cosine Clustered Threads */}
            <div className="glass-card border border-white/5 rounded-3xl p-6 flex items-center justify-between shadow-lg hover:translate-y-[-2px] transition-all duration-300">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  Clustered Threads
                </span>
                <span className="text-3xl font-extrabold text-white mt-2">
                  {data.metrics.activeThreadsCount}
                </span>
                <span className="text-[10px] text-purple-400 font-bold uppercase mt-1">
                  Vector groups formed
                </span>
              </div>
              <div className="p-4 bg-purple-600/10 border border-purple-500/20 text-purple-400 rounded-2xl">
                <GitFork className="w-6 h-6" />
              </div>
            </div>
          </section>

          {/* 2. INGESTION TREND & PLATFORM SHARE (split 2 grid) */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Ingestion Velocity Area Chart */}
            <div className="glass-card border border-white/5 rounded-3xl p-6 shadow-lg lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4.5 h-4.5 text-indigo-400" />
                  Scraper Ingestion Velocity (Hourly)
                </h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.hourlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#090b12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      labelStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="postsCount" stroke="#818cf8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sentiment Pie Donut Chart */}
            <div className="glass-card border border-white/5 rounded-3xl p-6 shadow-lg flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Smile className="w-4.5 h-4.5 text-indigo-400" />
                Sentiment Ratios
              </h3>
              <div className="h-64 w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.sentiments}
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="label"
                    >
                      {data.sentiments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#090b12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#f1f5f9' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* 3. PLATFORM & RADAR CATEGORIES (split 2 grid) */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Category Radar Chart */}
            <div className="glass-card border border-white/5 rounded-3xl p-6 shadow-lg flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4.5 h-4.5 text-indigo-400" />
                Issue Hot-spots (Radar Analysis)
              </h3>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data.categories}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis dataKey="category" stroke="#94a3b8" fontSize={9} />
                    <PolarRadiusAxis stroke="rgba(255,255,255,0.06)" angle={30} domain={[0, 'auto']} fontSize={8} />
                    <Radar name="Mentions Volume" dataKey="count" stroke="#c084fc" fill="#c084fc" fillOpacity={0.25} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#090b12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Platform Distribution Bar Chart */}
            <div className="glass-card border border-white/5 rounded-3xl p-6 shadow-lg lg:col-span-2 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Volume2 className="w-4.5 h-4.5 text-indigo-400" />
                Platform Mentions Volume
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.platforms} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="platform" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#090b12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#a5b4fc', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]}>
                      {data.platforms.map((entry, idx) => (
                        <Cell 
                          key={`bar-cell-${idx}`} 
                          fill={
                            entry.platform === 'twitter' ? '#1d9bf0' :
                            entry.platform === 'reddit' ? '#ff4500' :
                            entry.platform === 'youtube' ? '#ff0000' :
                            entry.platform === 'instagram' ? '#e1306c' : '#6366f1'
                          } 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* 4. INFLUENCERS & KEYWORDS GRID */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Top Influencers Card Grid */}
            <div className="glass-card border border-white/5 rounded-3xl p-6 shadow-lg flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-indigo-400" />
                Top Influential Mentions
              </h3>
              <div className="flex flex-col gap-3.5 mt-2">
                {data.influencers.map((infl, idx) => (
                  <div 
                    key={infl.handle} 
                    className="p-3 bg-slate-950/45 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-slate-900/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={infl.avatar} 
                        alt={infl.username} 
                        className="w-10 h-10 rounded-xl object-cover border border-white/10"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-white">{infl.username}</span>
                          {infl.verified && <Award className="w-3.5 h-3.5 text-indigo-400" />}
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold">{infl.handle}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-xs text-indigo-400 font-bold">{infl.followers.toLocaleString()} Followers</span>
                      <span className="text-[10px] text-slate-500 font-semibold mt-0.5">{infl.totalLikes} total post likes</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ingestion Density Keyword Cloud */}
            <div className="glass-card border border-white/5 rounded-3xl p-6 shadow-lg flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4.5 h-4.5 text-indigo-400" />
                Trending Keywords Cloud
              </h3>
              <div className="flex flex-wrap gap-2.5 mt-4 p-2 justify-center items-center">
                {data.keywords.map((kw, idx) => {
                  // Generate visual weight indices based on mention density
                  const sizeClass = idx === 0 ? 'text-lg text-indigo-400 bg-indigo-500/10 px-3.5 py-2 font-extrabold rounded-2xl border border-indigo-500/30' :
                                    idx < 3 ? 'text-sm text-purple-400 bg-purple-500/10 px-3 py-1.5 font-bold rounded-xl border border-purple-500/20' :
                                    'text-xs text-slate-400 bg-slate-900 px-2.5 py-1 font-semibold rounded-lg border border-white/5';

                  return (
                    <span 
                      key={kw.keyword}
                      className={`flex items-center gap-1.5 transition-all hover:scale-103 shadow-md ${sizeClass}`}
                    >
                      <span>#{kw.keyword.replace(/\s+/g, '')}</span>
                      <span className="text-[9px] font-bold text-slate-500 bg-slate-950 px-1 py-0.5 rounded border border-white/5">
                        {kw.count}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
