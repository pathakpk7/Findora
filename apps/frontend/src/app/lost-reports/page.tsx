"use client";

import { useCallback, useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { LostReportCard } from '@/components/lost-reports/LostReportCard';
import { LostReportGridSkeleton } from '@/components/lost-reports/LostReportSkeleton';
import { EmptyLostReports } from '@/components/lost-reports/EmptyLostReports';
import { getMyLostReports } from '@/lib/lostReportsApi';
import { LostReport, ItemCategory, LostReportStatus } from '@findora/types';
import { PlusCircle, ShieldAlert, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

function LostReportsDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [reports, setReports] = useState<LostReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const category = searchParams.get('category') || '';
  const status = searchParams.get('status') || '';
  const page = Math.max(Number(searchParams.get('page')) || 1, 1);

  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyLostReports({
        category: category || undefined,
        status: status || undefined,
        page,
        limit: 9,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      setReports(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalReports(res.total || 0);
    } catch (err: any) {
      setError(err?.message || 'Failed to load your lost reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [category, status, page]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const updateFilters = (newCategory: string, newStatus: string) => {
    const params = new URLSearchParams();
    if (newCategory) params.set('category', newCategory);
    if (newStatus) params.set('status', newStatus);
    params.set('page', '1');
    router.push(`/lost-reports?${params.toString()}`);
  };

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-semibold text-blue-200">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Private Owner Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              My Lost Item Reports
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Track and manage items you have reported missing on campus. Reports remain strictly private to you and campus staff for ownership verification.
            </p>
          </div>

          <Link
            href="/lost-reports/new"
            className="shrink-0 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Lost Item</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-xs font-semibold text-gray-700">Filter By:</span>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
          <select
            value={category}
            onChange={(e) => updateFilters(e.target.value, status)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          >
            <option value="">All Categories</option>
            {Object.values(ItemCategory).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => updateFilters(category, e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          >
            <option value="">All Statuses</option>
            {Object.values(LostReportStatus).map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LostReportGridSkeleton count={6} />
      ) : error ? (
        <div className="bg-white border border-gray-200 p-8 rounded-3xl text-center space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            {error.includes('Unauthorized') || error.includes('jwt')
              ? 'Sign in Required'
              : error === 'Failed to fetch'
              ? 'Cannot Connect to Findora Backend'
              : 'Unable to Load Reports'}
          </h3>
          <p className="text-gray-500 text-sm">
            {error.includes('Unauthorized') || error.includes('jwt')
              ? 'You need to be logged into your Findora account to view your private lost reports.'
              : error === 'Failed to fetch'
              ? 'The frontend could not reach http://localhost:3001. Please make sure the backend server is running.'
              : error}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            {error.includes('Unauthorized') || error.includes('jwt') ? (
              <Link
                href="/login?redirect=/lost-reports"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-blue-500/20"
              >
                Sign In to View Reports
              </Link>
            ) : (
              <button
                onClick={() => fetchReports()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-blue-500/20"
              >
                Retry Loading
              </button>
            )}
          </div>
        </div>
      ) : reports.length === 0 ? (
        <EmptyLostReports
          onClearFilters={
            category || status ? () => updateFilters('', '') : undefined
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>Showing {reports.length} of {totalReports} reports</span>
            <span>Page {page} of {totalPages}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <LostReportCard key={report.id} report={report} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('page', String(Math.max(page - 1, 1)));
                  router.push(`/lost-reports?${params.toString()}`);
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
                  router.push(`/lost-reports?${params.toString()}`);
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

export default function LostReportsDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <Suspense fallback={<LostReportGridSkeleton count={6} />}>
        <LostReportsDashboardContent />
      </Suspense>
    </div>
  );
}
