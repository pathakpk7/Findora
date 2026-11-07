"use client";

import { UserBadge } from '@findora/types';
import { Award, Lock, CheckCircle2 } from 'lucide-react';

const ALL_SYSTEM_BADGES = [
  {
    code: 'FIRST_FIND',
    name: 'First Find',
    icon: '🔍',
    description: 'Submitted your first verified found item report.',
    criteria: '1 Approved Found Item',
  },
  {
    code: 'HELPFUL_FINDER',
    name: 'Helpful Finder',
    icon: '🌟',
    description: 'Submitted 3 or more approved found items.',
    criteria: '3+ Approved Found Items',
  },
  {
    code: 'TRUSTED_FINDER',
    name: 'Trusted Finder',
    icon: '🛡️',
    description: 'Reached 150+ Trust Score in Findora reputation.',
    criteria: '150+ Trust Score',
  },
  {
    code: 'SUCCESSFUL_RETURN',
    name: 'First Return',
    icon: '🤝',
    description: 'Completed your first physical item return handover.',
    criteria: '1 Completed Handover',
  },
  {
    code: 'COMMUNITY_HERO',
    name: 'Community Hero',
    icon: '🏆',
    description: 'Completed 5 or more physical item return handovers.',
    criteria: '5+ Completed Handovers',
  },
  {
    code: 'CAMPUS_GUARDIAN',
    name: 'Campus Guardian',
    icon: '👑',
    description: 'Reached Level 4 Reputation (300+ Trust Score).',
    criteria: '300+ Trust Score',
  },
];

interface BadgeGridProps {
  userBadges: UserBadge[];
}

export function BadgeGrid({ userBadges }: BadgeGridProps) {
  const earnedMap = new Map(
    userBadges.map((ub) => [ub.badge?.code || '', ub]),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-stone-200 pb-3">
        <h3 className="text-base font-normal text-stone-900 flex items-center space-x-2">
          <Award className="w-4 h-4 text-stone-700" />
          <span>Campus Badges ({userBadges.length} / {ALL_SYSTEM_BADGES.length})</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_SYSTEM_BADGES.map((b) => {
          const earned = earnedMap.get(b.code);
          return (
            <div
              key={b.code}
              className={`p-4 border transition-colors flex items-start space-x-3.5 ${
                earned
                  ? 'bg-white border-stone-300 shadow-sm'
                  : 'bg-stone-50 border-stone-200 opacity-60'
              }`}
            >
              <div
                className={`w-10 h-10 flex items-center justify-center text-lg shrink-0 border ${
                  earned
                    ? 'bg-stone-100 border-stone-300 text-stone-900'
                    : 'bg-stone-100 border-stone-200 text-stone-400'
                }`}
              >
                {b.icon}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-xs font-medium uppercase tracking-wider ${
                      earned ? 'text-stone-900' : 'text-stone-600'
                    }`}
                  >
                    {b.name}
                  </h4>
                  {earned ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-stone-900 shrink-0" />
                  ) : (
                    <Lock className="w-3 h-3 text-stone-400 shrink-0" />
                  )}
                </div>

                <p className="text-xs text-stone-500 leading-relaxed">
                  {b.description}
                </p>

                <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-stone-400">
                  <span>{b.criteria}</span>
                  {earned && (
                    <span className="text-stone-900 font-medium">
                      Unlocked {new Date(earned.earnedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}