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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-gray-900 flex items-center space-x-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>Campus Badges ({userBadges.length} / {ALL_SYSTEM_BADGES.length})</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_SYSTEM_BADGES.map((b) => {
          const earned = earnedMap.get(b.code);
          return (
            <div
              key={b.code}
              className={`p-5 rounded-2xl border transition-all flex items-start space-x-4 ${
                earned
                  ? 'bg-gradient-to-br from-amber-500/10 via-white to-blue-500/10 border-amber-300 shadow-md hover:shadow-lg'
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm ${
                  earned
                    ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {b.icon}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-sm font-bold ${
                      earned ? 'text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    {b.name}
                  </h4>
                  {earned ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  )}
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                  {b.description}
                </p>

                <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-gray-400">
                  <span>{b.criteria}</span>
                  {earned && (
                    <span className="text-amber-700 font-semibold">
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
