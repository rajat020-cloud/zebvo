'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API } from '@/lib/api';
import { 
  Activity, 
  Lock, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // If already logged in, redirect directly to dashboard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please provide all credentials.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await API.login(username, password);
      
      setSuccess(true);
      
      // Store token and user metadata in localstorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setTimeout(() => {
        router.replace('/dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please inspect credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#07080e] relative overflow-hidden px-4">
      {/* Background Decorative Neon Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />

      {/* Main Glass Login Card */}
      <div className="w-full max-w-md glass-card rounded-3xl p-8 relative z-10 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.25)] mb-3">
            <Activity className="w-7 h-7" />
          </div>
          <h2 className="font-extrabold text-2xl bg-gradient-to-r from-white via-indigo-100 to-purple-300 bg-clip-text text-transparent tracking-widest uppercase">
            ZEBVO MONITOR
          </h2>
          <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mt-1.5">
            NLP Ingestion Control Panel
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-rose-300 text-sm shadow-[0_0_15px_rgba(239,68,68,0.05)]">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 text-emerald-300 text-sm shadow-[0_0_15px_rgba(16,185,129,0.05)]">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span>Authorization Successful! Initializing workspace...</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Username Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Username or Email
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-4 w-4 h-4 text-slate-400 group-focus:text-indigo-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all font-semibold"
                disabled={loading || success}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Secure Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all font-semibold"
                disabled={loading || success}
                required
              />
            </div>
          </div>

          {/* Action Trigger */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 border border-indigo-500/30 shadow-[0_4px_25px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_4px_20px_rgba(99,102,241,0.2)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In Security Session</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Helpful Hiring Credentials Bypass Tip Box */}
        <div className="mt-8 p-4 bg-indigo-950/30 border border-indigo-500/10 rounded-2xl">
          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Reviewer Access Guidelines
          </h4>
          <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
            Use the default credentials to review offline mock services or local DB instances instantly:
            <br />
            <span className="text-indigo-300 font-bold">User:</span> <code className="bg-slate-900 px-1 py-0.5 rounded text-white font-mono">admin</code>
            <span className="mx-2">|</span>
            <span className="text-indigo-300 font-bold">Password:</span> <code className="bg-slate-900 px-1 py-0.5 rounded text-white font-mono">password123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
