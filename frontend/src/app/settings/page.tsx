'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { 
  Play, 
  Settings as SettingsIcon, 
  Activity, 
  Database, 
  Key, 
  CheckCircle2, 
  AlertTriangle,
  Github
} from 'lucide-react';

export default function Settings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Scraper Pipeline Variables
  const [status, setStatus] = useState('Active');
  const [dbCount, setDbCount] = useState(104);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [intervalMin, setIntervalMin] = useState(15);

  // Credential States (Simulated Developer Setup)
  const [openaiKey, setOpenaiKey] = useState('••••••••••••••••••••••••••••');
  const [twitterToken, setTwitterToken] = useState('••••••••••••••••••••••••••••');
  const [redditId, setRedditId] = useState('••••••••••••••••••••••••••••');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Auth Guard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  // Load Initial Status
  const loadStatus = async () => {
    try {
      const data = await API.getScraperStatus();
      if (data.success) {
        setStatus(data.status || 'Active');
        setDbCount(data.totalStoredDocuments || 104);
        setKeywords(data.monitoredKeywords || []);
      }
    } catch (err) {
      console.error('Failed to load scraper settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  // Force Scrape Cycle Now
  const handleForceScrape = async () => {
    setTriggering(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const data = await API.triggerScraper();
      if (data.success) {
        setSuccessMsg(`Scraping loop triggered! Ingested ${data.ingestedCount} brand new, unique social mentions into MongoDB.`);
        // Reload status variables
        loadStatus();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Scraper execution failed. Check DB logs.');
    } finally {
      setTriggering(false);
    }
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex bg-[#07080e] min-h-screen text-slate-100 overflow-hidden">
        <Sidebar />
        <div className="flex-1 pl-64 flex flex-col h-screen overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-8 flex justify-center items-center">
            <span className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#07080e] min-h-screen text-slate-100 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <div className="flex-1 pl-64 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <Navbar />

        {/* Scrollable Settings Panel */}
        <main className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6 max-w-4xl mx-auto w-full">
          
          {/* Main Grid Content Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
            
            {/* LEFT 2/3 COLUMN: JOB ADMINISTRATION & CREDENTIALS */}
            <div className="md:col-span-2 flex flex-col gap-6">
              
              {/* Force Scrape Controller Card */}
              <div className="glass-card border border-white/5 rounded-3xl p-6 flex flex-col gap-4 shadow-lg">
                <h3 className="text-xs font-extrabold text-slate-200 tracking-wider flex items-center gap-2 uppercase">
                  <Activity className="w-4.5 h-4.5 text-indigo-400" />
                  Manual Social Scraper Activation
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Manually dispatch the social media scraper pipeline. The system will scan Twitter/X, Reddit, YouTube comments, and other networks using the keyword parameters below, applying full cleaning and NLP vectors on ingest.
                </p>

                {/* Status messages */}
                {successMsg && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 text-emerald-300 text-xs shadow-md">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-rose-300 text-xs shadow-md">
                    <AlertTriangle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Action Trigger Button */}
                <button
                  onClick={handleForceScrape}
                  disabled={triggering}
                  className="px-5 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(99,102,241,0.2)] hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {triggering ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Ingesting Active Feeds...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 text-white fill-white" />
                      <span>Execute Scraping Cycle Now</span>
                    </>
                  )}
                </button>
              </div>

              {/* Developer Configuration Key Form */}
              <div className="glass-card border border-white/5 rounded-3xl p-6 flex flex-col gap-4 shadow-lg">
                <h3 className="text-xs font-extrabold text-slate-200 tracking-wider flex items-center gap-2 uppercase">
                  <Key className="w-4.5 h-4.5 text-indigo-400" />
                  API Developer Credentials
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Configure active API credentials to connect real-time social streams and enable LLM summarizations.
                </p>

                {saveSuccess && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2.5 text-emerald-300 text-xs shadow-md animate-fadeIn">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                    <span>Configuration credentials updated successfully.</span>
                  </div>
                )}

                <form onSubmit={handleSaveCredentials} className="flex flex-col gap-4 mt-1">
                  {/* OpenAI API Key */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">OpenAI API Key</span>
                    <input
                      type="password"
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder="sk-..."
                      className="bg-slate-950/60 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors font-semibold"
                    />
                  </div>

                  {/* Twitter API key */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Twitter v2 Developer Token</span>
                    <input
                      type="password"
                      value={twitterToken}
                      onChange={(e) => setTwitterToken(e.target.value)}
                      className="bg-slate-950/60 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors font-semibold"
                    />
                  </div>

                  {/* Reddit credentials */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reddit Client Secret</span>
                    <input
                      type="password"
                      value={redditId}
                      onChange={(e) => setRedditId(e.target.value)}
                      className="bg-slate-950/60 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors font-semibold"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="px-4 py-3 bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl cursor-pointer hover:scale-[1.01] transition-all shadow-md"
                  >
                    Save Config Credentials
                  </button>
                </form>
              </div>

            </div>

            {/* RIGHT 1/3 COLUMN: PIPELINE PARAMETERS DETAILS */}
            <div className="md:col-span-1 flex flex-col gap-6">
              
              {/* Pipeline Health details */}
              <div className="glass-card border border-white/5 rounded-3xl p-6 flex flex-col gap-4 shadow-lg">
                <h3 className="text-xs font-extrabold text-slate-200 tracking-wider flex items-center gap-2 uppercase">
                  <Database className="w-4.5 h-4.5 text-indigo-400" />
                  Pipeline Status
                </h3>
                
                <div className="flex flex-col gap-3 text-xs mt-1">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400 font-semibold">Active Status:</span>
                    <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      {status}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400 font-semibold">MongoDB Footprint:</span>
                    <span className="text-white font-bold">{dbCount} documents</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400 font-semibold">Background Cron:</span>
                    <span className="text-white font-bold">Every {intervalMin} mins</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400 font-semibold">Clustering Vector:</span>
                    <span className="text-purple-400 font-bold">Cosine Matcher Active</span>
                  </div>
                </div>
              </div>

              {/* Active Monitored Keywords Capsules */}
              <div className="glass-card border border-white/5 rounded-3xl p-6 flex flex-col gap-4 shadow-lg">
                <h3 className="text-xs font-extrabold text-slate-200 tracking-wider flex items-center gap-2 uppercase">
                  <SettingsIcon className="w-4.5 h-4.5 text-indigo-400" />
                  Target Keywords
                </h3>
                <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                  Mentions matching these combinations are automatically harvested, analyzed, and categorized:
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {keywords.map(word => (
                    <span key={word} className="px-2.5 py-1 bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-lg capitalize">
                      {word}
                    </span>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
