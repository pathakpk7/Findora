"use client";

import { useCallback, useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { FoundItemCard } from '@/components/found-items/FoundItemCard';
import { FoundItemFilters } from '@/components/found-items/FoundItemFilters';
import { FoundItemGridSkeleton } from '@/components/found-items/FoundItemSkeleton';
import { EmptyFoundItems } from '@/components/found-items/EmptyFoundItems';
import { getPublicFoundItems } from '@/lib/foundItemsApi';
import { PublicFoundItem } from '@findora/types';
import { ChevronLeft, ChevronRight, Sparkles, AlertCircle, PlusCircle } from 'lucide-react';

function FoundItemsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<PublicFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize state from URL params
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const foundLocation = searchParams.get('foundLocation') || '';
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';
  const page = Math.max(Number(searchParams.get('page')) || 1, 1);
  const sortBy = (searchParams.get('sortBy') as 'createdAt' | 'foundDate') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPublicFoundItems({
        search: search || undefined,
        category: category || undefined,
        foundLocation: foundLocation || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        limit: 9,
        sortBy,
        sortOrder,
      });

      setItems(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalItems(res.total || 0);
    } catch (err: any) {
      setError(err?.message || 'Failed to load found items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, foundLocation, dateFrom, dateTo, page, sortBy, sortOrder]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const updateUrlParams = (newParams: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, val]) => {
      if (val !== undefined && val !== '' && val !== 1) {
        params.set(key, String(val));
      } else {
        params.delete(key);
      }
    });
    router.push(`/found-items?${params.toString()}`, { scroll: false });
  };

  const handleFilterChange = (filters: {
    search: string;
    category: string;
    foundLocation: string;
    dateFrom: string;
    dateTo: string;
    sortBy: 'createdAt' | 'foundDate';
    sortOrder: 'asc' | 'desc';
  }) => {
    updateUrlParams({
      ...filters,
      page: 1, // Reset to first page on filter change
    });
  };

  const handleResetFilters = () => {
    router.push('/found-items', { scroll: false });
  };

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner with Action Buttons */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center space-x-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Public Inventory</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Campus Lost & Found Inventory
            </h1>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Search approved found items reported by fellow students across campus buildings, libraries, and common areas.
            </p>
          </div>

          {/* Quick Direct Reporting Actions */}
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/lost-reports/new"
              className="inline-flex items-center justify-center space-x-2 px-5 py-3 bg-white text-rose-700 hover:bg-rose-50 font-bold text-sm rounded-2xl shadow-md transition-all transform hover:-translate-y-0.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Report Missing Item</span>
            </Link>
            <Link
              href="/found-items/new"
              className="inline-flex items-center justify-center space-x-2 px-5 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold text-sm rounded-2xl border border-white/20 backdrop-blur-md transition-all"
            >
              <PlusCircle className="w-4 h-4 text-blue-200" />
              <span>Report Found Item</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <FoundItemFilters
        initialSearch={search}
        initialCategory={category}
        initialLocation={foundLocation}
        initialDateFrom={dateFrom}
        initialDateTo={dateTo}
        initialSortBy={sortBy}
        initialSortOrder={sortOrder}
        onFilterChange={handleFilterChange}
      />

      {/* Content Section */}
      {loading ? (
        <FoundItemGridSkeleton count={6} />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-3xl text-center space-y-4 max-w-2xl mx-auto shadow-sm">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-base text-red-900">
              {error === 'Failed to fetch' ? 'Cannot Connect to Findora Backend' : 'Unable to Load Inventory'}
            </p>
            <p className="text-xs sm:text-sm text-red-600 leading-relaxed">
              {error === 'Failed to fetch' 
                ? 'The frontend could not reach http://localhost:3001. Please make sure the backend server is running ("npm run dev" in the root directory).'
                : error}
            </p>
          </div>
          <button
            onClick={() => fetchItems()}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm inline-block"
          >
            Retry Loading
          </button>
        </div>
      ) : items.length === 0 ? (
        <EmptyFoundItems
          onClearFilters={
            search || category || foundLocation || dateFrom || dateTo
              ? handleResetFilters
              : undefined
          }
        />
      ) : (
        <div className="space-y-6">
          {/* Results Counter */}
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>Showing {items.length} of {totalItems} approved items</span>
            <span>Page {page} of {totalPages}</span>
          </div>

          {/* Grid View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <FoundItemCard key={item.id} item={item} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => updateUrlParams({ page: Math.max(page - 1, 1) })}
                disabled={page === 1}
                className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-sm font-medium text-gray-700">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => updateUrlParams({ page: Math.min(page + 1, totalPages) })}
                disabled={page === totalPages}
                className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                aria-label="Next Page"
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

export default function FoundItemsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <Suspense fallback={<FoundItemGridSkeleton count={6} />}>
        <FoundItemsContent />
      </Suspense>
    </div>
  );
}
