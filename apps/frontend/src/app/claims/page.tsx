"use client";

import { useCallback, useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { ClaimCard } from '@/components/claims/ClaimCard';
import { ClaimGridSkeleton } from '@/components/claims/ClaimSkeleton';
import { EmptyClaims } from '@/components/claims/EmptyClaims';
import { getMyClaims } from '@/lib/claimsApi';
import { Claim, ClaimStatus } from '@findora/types';
import { ShieldCheck, ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';

function ClaimsDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const status = searchParams.get('status') || '';
  const page = Math.max(Number(searchParams.get('page')) || 1, 1);

  const [totalPages, setTotalPages] = useState(1);
  const [totalClaims, setTotalClaims] = useState(0);

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyClaims({
        status: status || undefined,
        page,
        limit: 9,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      setClaims(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalClaims(res.total || 0);
    } catch (err: any) {
      setError(err?.message || 'Failed to load your claims');
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const updateFilters = (newStatus: string) => {
    const params = new URLSearchParams();
    if (newStatus) params.set('status', newStatus);
    params.set('page', '1');
    router.push(`/claims?${params.toString()}`);
  };

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-orange-950 to-stone-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 bg-amber-500/20 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-semibold text-amber-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Private Claims Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              My Ownership Claims
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Track the status of your claims filed for found campus items. Your evidence remains private to you and reviewing campus staff.
            </p>
          </div>

          <Link
            href="/found-items"
            className="shrink-0 px-6 py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg hover:shadow-amber-500/25 flex items-center justify-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Browse Found Items</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-xs font-semibold text-gray-700">Filter By Status:</span>
        </div>

        <select
          value={status}
          onChange={(e) => updateFilters(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-700"
        >
          <option value="">All Statuses</option>
          {Object.values(ClaimStatus).map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <ClaimGridSkeleton count={6} />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center space-y-3">
          <p className="font-semibold">{error}</p>
          <button
            onClick={() => fetchClaims()}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      ) : claims.length === 0 ? (
        <EmptyClaims
          onClearFilters={status ? () => updateFilters('') : undefined}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>Showing {claims.length} of {totalClaims} claims</span>
            <span>Page {page} of {totalPages}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {claims.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('page', String(Math.max(page - 1, 1)));
                  router.push(`/claims?${params.toString()}`);
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
                  router.push(`/claims?${params.toString()}`);
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
    </main>
  );
}

export default function ClaimsDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <Suspense fallback={<ClaimGridSkeleton count={6} />}>
        <ClaimsDashboardContent />
      </Suspense>
    </div>
  );
}
