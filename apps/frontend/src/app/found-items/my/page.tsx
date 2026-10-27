"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { FoundItemStatusBadge } from '@/components/found-items/FoundItemStatusBadge';
import { FoundItemGridSkeleton } from '@/components/found-items/FoundItemSkeleton';
import { EmptyFoundItems } from '@/components/found-items/EmptyFoundItems';
import { getMyFoundItems } from '@/lib/foundItemsApi';
import { useUser } from '@/lib/useUser';
import { PublicFoundItem, ItemStatus } from '@findora/types';
import { PlusCircle, Edit3, MapPin, Calendar, Clock, Image as ImageIcon } from 'lucide-react';

export default function MyFoundItemsPage() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();

  const [items, setItems] = useState<PublicFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyFoundItems({ limit: 50 });
      setItems(res.data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load your submitted items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchMyItems();
    }
  }, [user, authLoading, router, fetchMyItems]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Submitted Found Items
            </h1>
            <p className="text-sm text-gray-600">
              Track moderation status and manage your submitted campus found items.
            </p>
          </div>

          <Link
            href="/found-items/new"
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 shadow-sm transition-colors shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Found Item</span>
          </Link>
        </div>

        {loading ? (
          <FoundItemGridSkeleton count={4} />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center space-y-3">
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => fetchMyItems()}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <EmptyFoundItems
            title="You haven't reported any found items yet"
            description="When you find an item on campus, report it here to help the owner recover it safely."
            showReportButton={true}
          />
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const mainImage = item.publicImages?.[0];
              const formattedDate = new Date(item.foundDate).toLocaleDateString(
                'en-US',
                { month: 'short', day: 'numeric', year: 'numeric' },
              );
              const submittedDate = new Date(item.createdAt).toLocaleDateString(
                'en-US',
                { month: 'short', day: 'numeric' },
              );

              const canEdit =
                item.status === ItemStatus.PENDING ||
                item.status === ItemStatus.REJECTED ||
                item.status === ItemStatus.APPROVED;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                      {mainImage ? (
                        <img
                          src={mainImage}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h3 className="font-bold text-gray-900 text-base">
                          {item.title}
                        </h3>
                        <FoundItemStatusBadge status={item.status} />
                      </div>

                      <p className="text-xs text-gray-500 line-clamp-1">
                        {item.publicDescription}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-500" />
                          <span>{item.foundLocation}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>Found: {formattedDate}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>Submitted: {submittedDate}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    {item.status === ItemStatus.APPROVED && (
                      <Link
                        href={`/found-items/${item.id}`}
                        className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        View Public Page
                      </Link>
                    )}

                    {canEdit && (
                      <Link
                        href={`/found-items/${item.id}/edit`}
                        className="inline-flex items-center space-x-1 px-3.5 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl text-xs font-medium hover:bg-blue-100 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Submission</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
