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
    <div className="border border-stone-800 bg-[#0f1013] p-6 sm:p-8 text-stone-100 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-mono tracking-wider text-stone-400 uppercase">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            <span>Campus Reputation Level {level}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-white">
            {levelName}
          </h2>
          <p className="text-stone-400 text-xs sm:text-sm max-w-lg leading-relaxed">
            Metric computed from verified custody handovers, verified owner claims, and peer confirmations.
          </p>
        </div>

        <div className="border border-stone-800 bg-stone-900/60 p-4 text-center shrink-0 min-w-[140px]">
          <div className="text-[11px] uppercase tracking-wider font-mono text-stone-400">
            Trust Score
          </div>
          <div className="text-3xl sm:text-4xl font-normal text-white tracking-tight flex items-center justify-center space-x-1.5 my-1">
            <span className="font-mono">{trustScore}</span>
          </div>
          <div className="text-[10px] font-mono text-stone-500">Scale 0 - 1000</div>
        </div>
      </div>

      {/* Progress Bar to Next Level */}
      <div className="space-y-2 pt-4 border-t border-stone-800">
        <div className="flex items-center justify-between text-xs font-mono text-stone-400">
          <span className="flex items-center space-x-1.5">
            <Award className="w-3.5 h-3.5 text-stone-300" />
            <span>Tier Progress</span>
          </span>
          <span>
            {trustScore} / {nextLevelScore} pts ({progressPercent}%)
          </span>
        </div>

        <div className="w-full bg-stone-900 h-1.5 overflow-hidden">
          <div
            className="bg-stone-200 h-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      </div>
    </div>
  );
}