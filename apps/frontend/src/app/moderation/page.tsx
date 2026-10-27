"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { ModeratorGuard } from '@/components/moderation/ModeratorGuard';
import { getModerationStats, getPendingFoundItems, getPendingClaims } from '@/lib/moderationApi';
import { Claim, PublicFoundItem } from '@findora/types';
import {
  ShieldAlert,
  FolderSearch,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export default function ModeratorDashboardPage() {
  const [stats, setStats] = useState<{
    pendingItemsCount: number;
    pendingClaimsCount: number;
    totalApprovedItemsCount: number;
    totalClaimedItemsCount: number;
  } | null>(null);

  const [recentItems, setRecentItems] = useState<PublicFoundItem[]>([]);
  const [recentClaims, setRecentClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError(null);
      try {
        const [statsData, itemsData, claimsData] = await Promise.all([
          getModerationStats(),
          getPendingFoundItems({ page: 1, limit: 5 }),
          getPendingClaims({ page: 1, limit: 5 }),
        ]);

        setStats(statsData);
        setRecentItems(itemsData.data || []);
        setRecentClaims(claimsData.data || []);
      } catch (err: any) {
        setError(err?.message || 'Failed to load moderation metrics');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <ModeratorGuard>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Dashboard Header */}
          <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center space-x-1.5 bg-purple-500/20 border border-purple-400/30 px-3 py-1 rounded-full text-xs font-semibold text-purple-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Internal Staff Operational Portal</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Campus Moderation Center
              </h1>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Review submitted campus found items and evaluate private ownership claims safely.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <p className="font-semibold">{error}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Found Items</span>
                    <Clock className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className="text-3xl font-black text-gray-900">{stats?.pendingItemsCount || 0}</p>
                  <Link
                    href="/moderation/found-items"
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-purple-600 hover:text-purple-800"
                  >
                    <span>Review Queue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Claims</span>
                    <ShieldAlert className="w-5 h-5 text-indigo-500" />
                  </div>
                  <p className="text-3xl font-black text-gray-900">{stats?.pendingClaimsCount || 0}</p>
                  <Link
                    href="/moderation/claims"
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-purple-600 hover:text-purple-800"
                  >
                    <span>Evaluate Claims</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Public Active Items</span>
                    <FolderSearch className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-3xl font-black text-gray-900">{stats?.totalApprovedItemsCount || 0}</p>
                  <span className="text-xs text-gray-400">Approved & Live</span>
                </div>

                <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Items Claimed</span>
                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-3xl font-black text-gray-900">{stats?.totalClaimedItemsCount || 0}</p>
                  <span className="text-xs text-gray-400">Ownership Verified</span>
                </div>
              </div>

              {/* Recent Pending Queues */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Found Items Queue */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Pending Found Items</h3>
                      <p className="text-xs text-gray-500">Items awaiting moderator approval</p>
                    </div>
                    <Link
                      href="/moderation/found-items"
                      className="text-xs font-bold text-purple-600 hover:text-purple-800"
                    >
                      View All ({stats?.pendingItemsCount || 0}) &rarr;
                    </Link>
                  </div>

                  {recentItems.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-4 text-center">No pending found items in queue.</p>
                  ) : (
                    <div className="space-y-3">
                      {recentItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                              {item.category}
                            </span>
                            <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.title}</h4>
                            <p className="text-xs text-gray-500">Location: {item.foundLocation}</p>
                          </div>
                          <Link
                            href={`/moderation/found-items/${item.id}`}
                            className="px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-xl hover:bg-purple-700 transition-colors shrink-0"
                          >
                            Review Item
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Claims Queue */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Pending Ownership Claims</h3>
                      <p className="text-xs text-gray-500">Claims awaiting evidence verification</p>
                    </div>
                    <Link
                      href="/moderation/claims"
                      className="text-xs font-bold text-purple-600 hover:text-purple-800"
                    >
                      View All ({stats?.pendingClaimsCount || 0}) &rarr;
                    </Link>
                  </div>

                  {recentClaims.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-4 text-center">No pending claims in queue.</p>
                  ) : (
                    <div className="space-y-3">
                      {recentClaims.map((claim) => (
                        <div
                          key={claim.id}
                          className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 flex items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                              PENDING
                            </span>
                            <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
                              {(claim as any).foundItem?.title || 'Found Item Claim'}
                            </h4>
                            <p className="text-xs text-amber-900 italic line-clamp-1">
                              &quot;{claim.evidence}&quot;
                            </p>
                          </div>
                          <Link
                            href={`/moderation/claims/${claim.id}`}
                            className="px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-xl hover:bg-amber-700 transition-colors shrink-0"
                          >
                            Review Claim
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </ModeratorGuard>
    </div>
  );
}
