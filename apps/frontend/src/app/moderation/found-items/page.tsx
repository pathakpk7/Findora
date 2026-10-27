"use client";

import { useCallback, useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { ModeratorGuard } from '@/components/moderation/ModeratorGuard';
import { getPendingFoundItems } from '@/lib/moderationApi';
import { PublicFoundItem } from '@findora/types';
import { ArrowLeft, Clock, ChevronLeft, ChevronRight, Loader2, MapPin, Tag } from 'lucide-react';

function PendingFoundItemsQueueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<PublicFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = Math.max(Number(searchParams.get('page')) || 1, 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPendingFoundItems({ page, limit: 10 });
      setItems(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalItems(res.total || 0);
    } catch (err: any) {
      setError(err?.message || 'Failed to load pending found items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

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
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Moderation Queue</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Found Item Submissions ({totalItems})
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
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-500 space-y-2">
            <p className="font-semibold text-lg text-gray-900">Queue Clear!</p>
            <p className="text-sm">There are currently no pending found items awaiting moderation.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 border border-gray-200 rounded-2xl p-5 hover:border-purple-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center space-x-1 bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded text-xs font-bold">
                        <Tag className="w-3 h-3" />
                        <span>{item.category}</span>
                      </span>
                      <span className="text-xs text-gray-400 font-mono">ID: {item.id.slice(0, 8)}...</span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                    <p className="text-xs text-gray-600 line-clamp-1">{item.publicDescription}</p>

                    <div className="flex items-center space-x-4 text-xs text-gray-500 pt-1">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{item.foundLocation}</span>
                      </span>
                      <span>Filed: {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Link
                    href={`/moderation/found-items/${item.id}`}
                    className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm text-center shrink-0"
                  >
                    Review Details &rarr;
                  </Link>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-3 pt-6 border-t border-gray-100">
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('page', String(Math.max(page - 1, 1)));
                    router.push(`/moderation/found-items?${params.toString()}`);
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
                    router.push(`/moderation/found-items?${params.toString()}`);
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

export default function PendingFoundItemsQueuePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <ModeratorGuard>
        <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>}>
          <PendingFoundItemsQueueContent />
        </Suspense>
      </ModeratorGuard>
    </div>
  );
}
