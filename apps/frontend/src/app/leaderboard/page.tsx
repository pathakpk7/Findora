"use client";

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { getLeaderboard } from '@/lib/reputationApi';
import { LeaderboardEntry } from '@findora/types';
import {
  Trophy,
  Award,
  Zap,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getLeaderboard(page, 20);
      setEntries(res.data || []);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      setError(err?.message || 'Failed to load campus leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [page]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-8 h-8 rounded-full bg-amber-400 text-white font-extrabold flex items-center justify-center shadow-md">
          🥇
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-8 h-8 rounded-full bg-slate-300 text-slate-800 font-extrabold flex items-center justify-center shadow-sm">
          🥈
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-8 h-8 rounded-full bg-amber-700 text-white font-extrabold flex items-center justify-center shadow-sm">
          🥉
        </span>
      );
    }
    return (
      <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-extrabold text-xs flex items-center justify-center">
        #{rank}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-amber-500/20 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-semibold text-amber-200">
              <Trophy className="w-3.5 h-3.5" />
              <span>Campus Rankings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Reputation Leaderboard
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm">
              Top campus contributors ranked by verified item returns and community trust score.
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="font-semibold text-sm">{error}</p>
            <button
              onClick={loadLeaderboard}
              className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-3">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-900">
              No Leaderboard Entries Yet
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Be the first student to submit and return found items to earn your spot on the leaderboard!
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="divide-y divide-gray-100">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50/80 transition-colors gap-4"
                >
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className="shrink-0">{getRankBadge(entry.rank)}</div>

                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-200">
                      {entry.avatar ? (
                        <img
                          src={entry.avatar}
                          alt={entry.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        entry.firstName?.[0] || entry.username[0].toUpperCase()
                      )}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-gray-900 truncate">
                          {entry.firstName
                            ? `${entry.firstName} ${entry.lastName || ''}`.trim()
                            : entry.username}
                        </h4>
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full inline-flex items-center space-x-1">
                          <ShieldCheck className="w-3 h-3 text-blue-600" />
                          <span>Lvl {entry.level} ({entry.levelName})</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        {entry.department && <span>{entry.department}</span>}
                        <span className="inline-flex items-center space-x-1 text-amber-700 font-medium">
                          <Award className="w-3 h-3 text-amber-500" />
                          <span>{entry.badgeCount} Badges</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base sm:text-lg font-black text-amber-500 flex items-center justify-end space-x-1">
                      <Zap className="w-4 h-4 fill-amber-400 text-amber-500" />
                      <span>{entry.trustScore}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      Trust Score
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 inline-flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 inline-flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
