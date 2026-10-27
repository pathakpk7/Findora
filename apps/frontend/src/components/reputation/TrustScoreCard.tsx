"use client";

import { Award, ShieldCheck, Zap } from 'lucide-react';

interface TrustScoreCardProps {
  trustScore: number;
  level: number;
  levelName: string;
  nextLevelScore: number;
  progressPercent: number;
}

export function TrustScoreCard({
  trustScore,
  level,
  levelName,
  nextLevelScore,
  progressPercent,
}: TrustScoreCardProps) {
  return (
    <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6 relative overflow-hidden">
      {/* Background Graphic Accent */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-semibold text-blue-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Campus Reputation Level {level}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {levelName}
          </h2>
          <p className="text-gray-300 text-xs sm:text-sm">
            Earned through verified returns and honest campus submissions.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur border border-white/15 rounded-2xl p-4 text-center shrink-0 min-w-[130px]">
          <div className="text-xs uppercase tracking-wider text-blue-200 font-bold">
            Trust Score
          </div>
          <div className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight flex items-center justify-center space-x-1">
            <Zap className="w-6 h-6 fill-amber-300 text-amber-300" />
            <span>{trustScore}</span>
          </div>
          <div className="text-[10px] text-gray-300 mt-0.5">Max Limit 1000</div>
        </div>
      </div>

      {/* Progress Bar to Next Level */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
          <span className="flex items-center space-x-1">
            <Award className="w-3.5 h-3.5 text-blue-400" />
            <span>Level {level} Progress</span>
          </span>
          <span>
            {trustScore} / {nextLevelScore} pts ({progressPercent}%)
          </span>
        </div>

        <div className="w-full bg-white/10 rounded-full h-3 p-0.5 overflow-hidden border border-white/10">
          <div
            className="bg-gradient-to-r from-blue-500 via-indigo-400 to-amber-400 h-full rounded-full transition-all duration-700 ease-out shadow-sm"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
