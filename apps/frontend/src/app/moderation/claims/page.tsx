"use client";

import { useCallback, useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { ModeratorGuard } from '@/components/moderation/ModeratorGuard';
import { getPendingClaims } from '@/lib/moderationApi';
import { Claim } from '@findora/types';
import { ArrowLeft, ShieldAlert, ChevronLeft, ChevronRight, Loader2, Lock } from 'lucide-react';

function PendingClaimsQueueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = Math.max(Number(searchParams.get('page')) || 1, 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClaims, setTotalClaims] = useState(0);

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPendingClaims({ page, limit: 10 });
      setClaims(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalClaims(res.total || 0);
    } catch (err: any) {
      setError(err?.message || 'Failed to load pending claims');
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        href="/moderation"
        className="inline-flex items-center space-x-1 text-xs font-semibold text-gray-600 hover:text-purple-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Moderation Dashboard</span>
      </Link>

      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-semibold mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Pending Claims Evaluation Queue</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Ownership Claims ({totalClaims})
            </h1>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center space-y-2">
            <p className="font-semibold">{error}</p>
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-12 text-gray-500 space-y-2">
            <p className="font-semibold text-lg text-gray-900">Queue Clear!</p>
            <p className="text-sm">There are currently no pending ownership claims awaiting review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {claims.map((claim) => {
                const item = (claim as any).foundItem;
                return (
                  <div
                    key={claim.id}
                    className="bg-amber-50/40 border border-amber-200 rounded-2xl p-5 hover:border-amber-400 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center space-x-1 bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded text-xs font-bold uppercase">
                          {claim.status}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">Claim ID: {claim.id.slice(0, 8)}...</span>
                      </div>

                      <h3 className="text-base font-bold text-gray-900">
                        Item: {item?.title || 'Found Item'}
                      </h3>

                      <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-gray-700 space-y-1">
                        <div className="flex items-center space-x-1 font-semibold text-amber-900">
                          <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>Claimant Private Evidence Statement</span>
                        </div>
                        <p className="italic line-clamp-2">&quot;{claim.evidence}&quot;</p>
                      </div>

                      <p className="text-xs text-gray-500">
                        Filed on: {new Date(claim.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <Link
                      href={`/moderation/claims/${claim.id}`}
                      className="w-full sm:w-auto px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm text-center shrink-0"
                    >
                      Evaluate Claim &rarr;
                    </Link>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-3 pt-6 border-t border-gray-100">
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('page', String(Math.max(page - 1, 1)));
                    router.push(`/moderation/claims?${params.toString()}`);
                  }}
                  disabled={page === 1}
                  className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('page', String(Math.min(page + 1, totalPages)));
                    router.push(`/moderation/claims?${params.toString()}`);
                  }}
                  disabled={page === totalPages}
                  className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function PendingClaimsQueuePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <ModeratorGuard>
        <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>}>
          <PendingClaimsQueueContent />
        </Suspense>
      </ModeratorGuard>
    </div>
  );
}
