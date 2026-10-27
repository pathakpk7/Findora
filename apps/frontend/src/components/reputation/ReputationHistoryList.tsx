"use client";

import { TrustScoreHistory } from '@findora/types';
import { History, TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface ReputationHistoryListProps {
  history: TrustScoreHistory[];
}

export function ReputationHistoryList({ history }: ReputationHistoryListProps) {
  if (history.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-3xl p-8 text-center space-y-2">
        <History className="w-10 h-10 text-gray-300 mx-auto" />
        <h4 className="text-sm font-bold text-gray-800">
          No Reputation History Yet
        </h4>
        <p className="text-xs text-gray-500 max-w-xs mx-auto">
          Points earned through found item reports, claims, and verified returns will be recorded here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-extrabold text-gray-900 flex items-center space-x-2">
        <History className="w-5 h-5 text-blue-600" />
        <span>Reputation History</span>
      </h3>

      <div className="bg-white border border-gray-200 rounded-3xl divide-y divide-gray-100 overflow-hidden shadow-sm">
        {history.map((h) => {
          const isPositive = h.amount >= 0;
          return (
            <div
              key={h.id}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50/80 transition-colors gap-4"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    isPositive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {h.reason}
                  </p>
                  <div className="flex items-center space-x-1.5 text-[11px] text-gray-400">
                    <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                    <span>{new Date(h.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div
                  className={`text-sm font-extrabold ${
                    isPositive ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {isPositive ? `+${h.amount}` : h.amount} pts
                </div>
                <div className="text-[10px] text-gray-400">
                  Score: {h.newScore}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
