'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { API, Post } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Share2, 
  ThumbsUp, 
  Eye, 
  Globe2, 
  GitFork, 
  Trash2, 
  X, 
  ChevronRight, 
  CornerDownRight,
  TrendingUp,
  Award
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPostsCount, setTotalPostsCount] = useState(0);

  // Active Filter States
  const [search, setSearch] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedSentiments, setSelectedSentiments] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [gibberish, setGibberish] = useState('false'); // default hiding spam
  const [hours, setHours] = useState<number | undefined>(undefined);

  // Translation States
  const [translatingPostId, setTranslatingPostId] = useState<string | null>(null);
  const [translationLang, setTranslationLang] = useState<Record<string, string>>({}); // postId -> langCode
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({}); // postId -> text

  // Cluster Thread Dialog State
  const [activeClusterId, setActiveClusterId] = useState<string | null>(null);
  const [activeClusterPosts, setActiveClusterPosts] = useState<Post[]>([]);
  const [loadingCluster, setLoadingCluster] = useState(false);

  // Constants
  const platformsList = ['twitter', 'reddit', 'youtube', 'instagram', 'facebook', 'linkedin', 'tiktok'];
  const sentimentsList = ['positive', 'neutral', 'negative'];
  const categoriesList = [
    'Application', 'Renewal', 'Appointments', 'Tatkal', 'Visa', 
    'Travel Issues', 'Government Announcements', 'Scams/Fraud', 'Personal Experiences'
  ];
  const languagesList = [
    { code: 'hi', label: 'Hindi' },
    { code: 'pa', label: 'Punjabi' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
    { code: 'ar', label: 'Arabic' },
    { code: 'zh', label: 'Chinese' },
    { code: 'ru', label: 'Russian' },
    { code: 'ja', label: 'Japanese' }
  ];

  // Auth Guard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  // Load Feed Data
  const fetchFeed = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const data = await API.getPosts({
        page: pageNum,
        limit: 10,
        search: search.trim() !== '' ? search : undefined,
        platform: selectedPlatforms.length ? selectedPlatforms : undefined,
        sentiment: selectedSentiments.length ? selectedSentiments : undefined,
        category: selectedCategories.length ? selectedCategories : undefined,
        gibberish,
        hours
      });

      if (data.success) {
        if (append) {
          setPosts(prev => {
            // Filter duplicates to prevent index key collision
            const existingIds = new Set(prev.map(p => p._id));
            const fresh = data.posts.filter(p => !existingIds.has(p._id));
            return [...prev, ...fresh];
          });
        } else {
          setPosts(data.posts);
        }
        setTotalPages(data.pages);
        setTotalPostsCount(data.total);
        setPage(data.page);
      }
    } catch (err) {
      console.error('Failed to load posts feed:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, selectedPlatforms, selectedSentiments, selectedCategories, gibberish, hours]);

  // Fetch initial posts on filter changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFeed(1, false);
    }, 400); // Debounce search changes slightly

    return () => clearTimeout(delayDebounceFn);
  }, [fetchFeed]);

  // Infinite Scroll Trigger
  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 80) {
      if (!loadingMore && page < totalPages) {
        fetchFeed(page + 1, true);
      }
    }
  };

  // Toggle Filters Utilities
  const togglePlatform = (p: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p]
    );
  };

  const toggleSentiment = (s: string) => {
    setSelectedSentiments(prev => 
      prev.includes(s) ? prev.filter(item => item !== s) : [...prev, s]
    );
  };

  const toggleCategory = (c: string) => {
    setSelectedCategories(prev => 
      prev.includes(c) ? prev.filter(item => item !== c) : [...prev, c]
    );
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedPlatforms([]);
    setSelectedSentiments([]);
    setSelectedCategories([]);
    setGibberish('false');
    setHours(undefined);
  };

  // Trigger Post Translation
  const handleTranslate = async (postId: string, langCode: string) => {
    if (langCode === 'original') {
      setTranslationLang(prev => {
        const copy = { ...prev };
        delete copy[postId];
        return copy;
      });
      return;
    }

    setTranslatingPostId(postId);
    try {
      const translated = await API.translatePost(postId, langCode);
      setTranslatedTexts(prev => ({ ...prev, [postId]: translated }));
      setTranslationLang(prev => ({ ...prev, [postId]: langCode }));
    } catch (err) {
      console.error('Translation trigger failed:', err);
    } finally {
      setTranslatingPostId(null);
    }
  };

  // Open Similarity Cluster Thread Modal
  const handleViewCluster = async (clusterId: string) => {
    setActiveClusterId(clusterId);
    setLoadingCluster(true);
    try {
      const data = await API.getClusterThread(clusterId);
      if (data.success) {
        setActiveClusterPosts(data.posts);
      }
    } catch (err) {
      console.error('Failed to load clustered posts:', err);
    } finally {
      setLoadingCluster(false);
    }
  };

  // Get Platform Color Accents
  const getPlatformColors = (platform: string) => {
    switch (platform) {
      case 'twitter': return { bg: 'bg-[#1d9bf0]/10', border: 'border-[#1d9bf0]/30', text: 'text-[#1d9bf0]' };
      case 'reddit': return { bg: 'bg-[#ff4500]/10', border: 'border-[#ff4500]/30', text: 'text-[#ff4500]' };
      case 'youtube': return { bg: 'bg-[#ff0000]/10', border: 'border-[#ff0000]/30', text: 'text-[#ff0000]' };
      case 'instagram': return { bg: 'bg-[#e1306c]/10', border: 'border-[#e1306c]/30', text: 'text-[#e1306c]' };
      case 'facebook': return { bg: 'bg-[#1877f2]/10', border: 'border-[#1877f2]/30', text: 'text-[#1877f2]' };
      case 'linkedin': return { bg: 'bg-[#0a66c2]/10', border: 'border-[#0a66c2]/30', text: 'text-[#0a66c2]' };
      default: return { bg: 'bg-indigo-600/10', border: 'border-indigo-500/20', text: 'text-indigo-400' };
    }
  };

  return (
    <div className="flex bg-[#07080e] min-h-screen text-slate-100 overflow-hidden">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <div className="flex-1 pl-64 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <Navbar />

        {/* Outer Split Pane Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT: Feed stream & Search */}
          <main 
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6"
          >
            {/* Real-time counters panel */}
            <div className="flex items-center justify-between p-4 bg-slate-900/40 border border-white/5 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-ping" />
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Live Stream Active
                </span>
              </div>
              <span className="text-xs text-indigo-400 font-bold">
                Showing {totalPostsCount} matches in database
              </span>
            </div>

            {/* Skeletons Loader */}
            {loading ? (
              <div className="flex flex-col gap-5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="glass-card border border-white/5 rounded-3xl p-6 relative overflow-hidden h-44 shimmer-anim" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              /* Empty state feedback */
              <div className="flex flex-col items-center justify-center py-20 text-center glass-card border border-white/5 rounded-3xl">
                <Trash2 className="w-12 h-12 text-slate-600 mb-4 animate-bounce" />
                <h3 className="text-lg font-bold text-slate-300">No passport mentions matched</h3>
                <p className="text-sm text-slate-500 max-w-sm mt-1">
                  Adjust active filter sliders, enable spam toggles, or hit "Scrape Now" in settings to fetch new records.
                </p>
                <button 
                  onClick={clearAllFilters}
                  className="mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] cursor-pointer"
                >
                  Clear Active Filters
                </button>
              </div>
            ) : (
              /* Posts Feed Cards List */
              <div className="flex flex-col gap-5">
                {posts.map(post => {
                  const platStyle = getPlatformColors(post.platform);
                  const isTranslated = !!translationLang[post._id];
                  const currentLang = translationLang[post._id] || 'original';

                  // Sentiment label colors
                  let sentColor = 'text-slate-400 border-slate-500/20 bg-slate-500/5';
                  if (post.sentiment.label === 'positive') sentColor = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
                  if (post.sentiment.label === 'negative') sentColor = 'text-rose-400 border-rose-500/20 bg-rose-500/5';

                  return (
                    <article 
                      key={post._id} 
                      className={`glass-card hover:bg-slate-900/35 border ${post.gibberish ? 'border-amber-500/25 bg-amber-500/5' : 'border-white/5'} rounded-3xl p-6 transition-all duration-300 glow-border-indigo flex flex-col gap-4 relative overflow-hidden`}
                    >
                      {/* Gibberish Alert Banner */}
                      {post.gibberish && (
                        <div className="absolute top-0 right-0 left-0 bg-gradient-to-r from-amber-600/25 to-transparent border-b border-amber-500/20 px-6 py-1.5 flex items-center justify-between">
                          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                            Spam / Bot Flagged: {post.gibberishReason}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_5px_rgba(245,158,11,0.8)] animate-pulse" />
                        </div>
                      )}

                      {/* Header block (Author profile, platform, time) */}
                      <div className={`flex items-start justify-between ${post.gibberish ? 'mt-6' : ''}`}>
                        <div className="flex items-center gap-3">
                          {/* Profile Avatar */}
                          {post.author.avatar ? (
                            <img 
                              src={post.author.avatar} 
                              alt={post.author.username} 
                              className="w-10 h-10 rounded-xl object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center text-sm font-bold text-indigo-400">
                              {post.author.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-bold text-white tracking-wide">
                                {post.author.username}
                              </h4>
                              {post.author.verified && (
                                <Award className="w-3.5 h-3.5 text-indigo-400" />
                              )}
                            </div>
                            <span className="text-xs text-slate-400 font-semibold">
                              {post.author.handle}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Platform Badge */}
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border ${platStyle.bg} ${platStyle.border} ${platStyle.text}`}>
                            {post.platform}
                          </span>
                          {/* Post Date */}
                          <span className="text-xs text-slate-500 font-semibold">
                            {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Text content block */}
                      <div className="flex flex-col gap-2">
                        {/* Translation overlay warning */}
                        {translatingPostId === post._id && (
                          <div className="py-4 text-center text-indigo-400 text-xs font-semibold animate-pulse">
                            Translating stream...
                          </div>
                        )}
                        
                        {translatingPostId !== post._id && (
                          <p className="text-sm text-slate-200 leading-relaxed font-semibold">
                            {isTranslated ? translatedTexts[post._id] : post.originalContent}
                          </p>
                        )}

                        {/* Keyword list tag */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {post.keywords.map(kw => (
                            <span key={kw} className="text-[10px] text-slate-500 font-bold bg-slate-950/45 px-2 py-0.5 rounded border border-white/5">
                              #{kw.replace(/\s+/g, '')}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-[1px] bg-white/5 my-1" />

                      {/* Analytics tags & AI summary */}
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          {/* Sentiment Tag */}
                          <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full uppercase border ${sentColor}`}>
                            {post.sentiment.label} ({post.sentiment.score.toFixed(1)})
                          </span>

                          {/* Category Tag */}
                          <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-full uppercase bg-indigo-600/10 border border-indigo-500/20 text-indigo-300">
                            {post.category}
                          </span>

                          {/* Country */}
                          <span className="text-[10px] text-slate-500 font-bold">
                            📍 {post.country}
                          </span>
                        </div>

                        {/* Translation selectors toolbar */}
                        <div className="flex items-center gap-1.5">
                          <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                          <select
                            value={currentLang}
                            onChange={(e) => handleTranslate(post._id, e.target.value)}
                            className="bg-slate-950/70 border border-white/10 rounded-lg text-[10px] font-bold text-slate-300 py-1 px-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
                          >
                            <option value="original">Original Text</option>
                            {languagesList.map(lang => (
                              <option key={lang.code} value={lang.code}>{lang.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* AI Summarized dropdown box */}
                      {post.summary && (
                        <div className="p-3 bg-indigo-600/5 border border-indigo-500/10 rounded-2xl flex flex-col gap-1">
                          <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            AI Insight Summary
                          </span>
                          <p className="text-xs text-slate-300 font-semibold italic">
                            "{post.summary}"
                          </p>
                        </div>
                      )}

                      {/* Footer Actions (likes/comments, and thread agrupation check) */}
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
                        <div className="flex items-center gap-6 text-slate-400 text-xs font-bold">
                          <span className="flex items-center gap-1.5 hover:text-slate-300 transition-colors">
                            <ThumbsUp className="w-4 h-4" /> {post.engagement.likes}
                          </span>
                          <span className="flex items-center gap-1.5 hover:text-slate-300 transition-colors">
                            <MessageSquare className="w-4 h-4" /> {post.engagement.comments}
                          </span>
                          <span className="flex items-center gap-1.5 hover:text-slate-300 transition-colors">
                            <Share2 className="w-4 h-4" /> {post.engagement.shares}
                          </span>
                          <span className="flex items-center gap-1.5 hover:text-slate-300 transition-colors">
                            <Eye className="w-4 h-4" /> {post.engagement.views}
                          </span>
                        </div>

                        {/* Similarity cluster badge */}
                        {post.clusterId && (
                          <button
                            onClick={() => handleViewCluster(post.clusterId!)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/10 border border-purple-500/30 text-purple-300 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-purple-600/20 hover:scale-102 transition-all cursor-pointer shadow-[0_0_10px_rgba(168,85,247,0.05)]"
                          >
                            <GitFork className="w-3.5 h-3.5" />
                            <span>Linked Mentions</span>
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Load more spinner */}
            {loadingMore && (
              <div className="py-4 flex justify-center">
                <span className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            )}
          </main>

          {/* RIGHT: FILTERS CONTROL BAR (Dynamic static sidebar) */}
          <aside className="w-80 border-l border-white/5 bg-[#0a0b12]/45 overflow-y-auto px-6 py-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-200 tracking-wide flex items-center gap-2 uppercase">
                <Filter className="w-4 h-4 text-indigo-400" />
                Filter Stream
              </h3>
              <button 
                onClick={clearAllFilters}
                className="text-[10px] text-slate-500 hover:text-indigo-400 transition-colors font-bold uppercase cursor-pointer"
              >
                Reset All
              </button>
            </div>

            {/* Search Input Box */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Keyword Query Search
              </label>
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g. tatkal delay, scam..."
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Platform select chips */}
            <div className="flex flex-col gap-2.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Select Platform Sources
              </label>
              <div className="flex flex-wrap gap-1.5">
                {platformsList.map(platform => {
                  const isSel = selectedPlatforms.includes(platform);
                  return (
                    <button
                      key={platform}
                      onClick={() => togglePlatform(platform)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold capitalize transition-all cursor-pointer border ${
                        isSel 
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.25)]' 
                          : 'bg-slate-950/60 text-slate-400 border-white/5 hover:border-slate-800 hover:text-slate-300'
                      }`}
                    >
                      {platform}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sentiment checkboxes */}
            <div className="flex flex-col gap-2.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Sentiment Levels
              </label>
              <div className="flex flex-wrap gap-1.5">
                {sentimentsList.map(sent => {
                  const isSel = selectedSentiments.includes(sent);
                  return (
                    <button
                      key={sent}
                      onClick={() => toggleSentiment(sent)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold capitalize transition-all cursor-pointer border ${
                        isSel 
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.25)]' 
                          : 'bg-slate-950/60 text-slate-400 border-white/5 hover:border-slate-800 hover:text-slate-300'
                      }`}
                    >
                      {sent}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Categories badges */}
            <div className="flex flex-col gap-2.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Passport Categories
              </label>
              <div className="flex flex-wrap gap-1.5">
                {categoriesList.map(cat => {
                  const isSel = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer border ${
                        isSel 
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.25)]' 
                          : 'bg-slate-950/60 text-slate-400 border-white/5 hover:border-slate-800 hover:text-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gibberish toggler selection */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Gibberish / Bot Filtering
              </label>
              <select
                value={gibberish}
                onChange={(e) => setGibberish(e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-slate-300 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="false">Hide Spam/Bot Posts</option>
                <option value="true">Show ONLY Spam/Bot Posts</option>
                <option value="all">Analyze All Content Ingested</option>
              </select>
            </div>

            {/* Hours selection */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Time range filter
              </label>
              <select
                value={hours || ''}
                onChange={(e) => setHours(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-slate-300 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="">All Historical Records</option>
                <option value="1">Last 1 Hour</option>
                <option value="12">Last 12 Hours</option>
                <option value="24">Last 24 Hours</option>
              </select>
            </div>
          </aside>
        </div>
      </div>

      {/* CLUSTER THREAD DIALOG OVERLAY */}
      {activeClusterId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm transition-all animate-fadeIn">
          <div className="w-full max-w-2xl glass-card rounded-3xl p-6 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] max-h-[85vh] flex flex-col overflow-hidden relative">
            {/* Close Button */}
            <button 
              onClick={() => { setActiveClusterId(null); setActiveClusterPosts([]); }}
              className="absolute top-5 right-5 p-2 bg-slate-900 border border-white/5 rounded-xl text-slate-400 hover:text-slate-200 cursor-pointer hover:scale-102 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="mb-4 pr-12 flex flex-col">
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2 tracking-wide bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                <GitFork className="w-5 h-5 text-purple-400" />
                Linked Cosine Similarity Thread
              </h3>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                Vector Similarity Group ID: <code className="text-purple-300 font-mono">{activeClusterId.slice(0, 15)}...</code>
              </p>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-4 py-2 pr-1">
              {loadingCluster ? (
                <div className="py-12 flex justify-center">
                  <span className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                </div>
              ) : activeClusterPosts.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-8">No linked posts in this cluster.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="p-3 bg-purple-600/5 border border-purple-500/10 rounded-2xl mb-2 text-xs text-purple-300 font-semibold">
                    💡 Our Vector Ingestion matching engine grouped these {activeClusterPosts.length} posts together because their TF-IDF keywords share high Cosine-Similarity metrics (&gt; 0.70 similarity quotient).
                  </div>

                  {activeClusterPosts.map((cp, idx) => {
                    const plStyle = getPlatformColors(cp.platform);
                    return (
                      <div key={cp._id} className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {idx === 0 ? (
                              <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[8px] font-bold uppercase">
                                Primary Node
                              </span>
                            ) : (
                              <div className="flex items-center gap-1 text-purple-300 font-bold text-[9px] uppercase">
                                <CornerDownRight className="w-3.5 h-3.5" />
                                Matching Leaf
                              </div>
                            )}
                            <span className="text-xs text-slate-300 font-bold">
                              {cp.author.handle}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase border ${plStyle.bg} ${plStyle.border} ${plStyle.text}`}>
                              {cp.platform}
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold">
                              {new Date(cp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                          {cp.originalContent}
                        </p>

                        <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold">
                          <span>📍 {cp.country}</span>
                          <span>Sentiment: {cp.sentiment.label} ({cp.sentiment.score.toFixed(1)})</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
              <button 
                onClick={() => { setActiveClusterId(null); setActiveClusterPosts([]); }}
                className="px-5 py-2.5 bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Thread Stream
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
