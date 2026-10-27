"use client";

import React from 'react';
import { ShieldCheck, Sparkles, Radio, Lock } from 'lucide-react';

export function LostAndFoundCanvas() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* 1. Radar Scanning Centerpiece (Lost & Found Radar) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] opacity-15">
        {/* Radar concentric circles */}
        <div className="absolute inset-0 rounded-full border border-cyan-400/40" />
        <div className="absolute inset-16 sm:inset-24 rounded-full border border-blue-400/30" />
        <div className="absolute inset-32 sm:inset-48 rounded-full border border-indigo-400/20" />
        <div className="absolute inset-[45%] rounded-full bg-cyan-400/20 animate-radar-ping" />

        {/* Sweeping Radar Scanner Line */}
        <div className="absolute inset-0 animate-radar-sweep origin-center">
          <div className="w-1/2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-white shadow-[0_0_12px_#22d3ee]" />
        </div>
      </div>

      {/* 2. Floating Status: Campus Radar (Top Left) */}
      <div className="absolute top-12 left-6 sm:left-16 opacity-75 animate-sway-keys hidden sm:block">
        <div className="bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md px-3.5 py-2.5 rounded-2xl flex items-center space-x-2.5 shadow-xl shadow-cyan-500/10">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
              Network Active
            </span>
            <span className="block text-xs font-semibold text-slate-200">
              Campus Lost &amp; Found
            </span>
          </div>
        </div>
      </div>

      {/* 3. Floating Status: AI Verification (Top Right) */}
      <div className="absolute top-16 right-6 sm:right-20 opacity-75 animate-float-slow hidden sm:block">
        <div className="bg-slate-900/80 border border-blue-500/30 backdrop-blur-md px-3.5 py-2.5 rounded-2xl flex items-center space-x-2.5 shadow-xl shadow-blue-500/10">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] font-bold text-blue-300 uppercase tracking-wider">
              Smart Matching
            </span>
            <span className="block text-xs font-semibold text-slate-200">
              AI Similarity Analysis
            </span>
          </div>
        </div>
      </div>

      {/* 4. Floating Status: Privacy Protected (Bottom Left) */}
      <div className="absolute bottom-24 left-8 sm:left-24 opacity-70 animate-float-slower hidden md:block">
        <div className="bg-slate-900/80 border border-emerald-500/30 backdrop-blur-md px-3.5 py-2.5 rounded-2xl flex items-center space-x-2.5 shadow-xl shadow-emerald-500/10">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
              Protected Privacy
            </span>
            <span className="block text-xs font-semibold text-slate-200">
              Verified Claims Only
            </span>
          </div>
        </div>
      </div>

      {/* 5. Floating Status: Community Trust (Bottom Right) */}
      <div className="absolute bottom-20 right-8 sm:right-28 opacity-75 animate-float-slow hidden md:block">
        <div className="bg-slate-900/80 border border-indigo-500/30 backdrop-blur-md px-3.5 py-2.5 rounded-2xl flex items-center space-x-2.5 shadow-xl shadow-indigo-500/10">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
              Trust Score System
            </span>
            <span className="block text-xs font-semibold text-slate-200">
              Secure QR Handover
            </span>
          </div>
        </div>
      </div>

      {/* Subtle sparkling dust orbs */}
      <div className="absolute top-1/4 left-1/3 w-2 h-2 rounded-full bg-cyan-300/40 animate-ping" />
      <div className="absolute bottom-1/3 right-1/4 w-2 h-2 rounded-full bg-indigo-400/40 animate-ping delay-700" />
      <div className="absolute top-2/3 left-1/5 w-1.5 h-1.5 rounded-full bg-amber-300/30 animate-ping delay-1000" />
    </div>
  );
}
