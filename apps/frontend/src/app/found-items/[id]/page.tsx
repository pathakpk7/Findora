"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { FoundItemGallery } from '@/components/found-items/FoundItemGallery';
import { FoundItemStatusBadge } from '@/components/found-items/FoundItemStatusBadge';
import { ClaimModal } from '@/components/claims/ClaimModal';
import { getPublicFoundItemById } from '@/lib/foundItemsApi';
import { useUser } from '@/lib/useUser';
import { PublicFoundItem, ItemStatus } from '@findora/types';
import { MapPin, Calendar, ArrowLeft, ShieldCheck, HelpCircle, CheckCircle2, Lock } from 'lucide-react';

export default function FoundItemDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { user } = useUser();
  const [item, setItem] = useState<PublicFoundItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function loadItem() {
      setLoading(true);
      setError(null);
      try {
        const data = await getPublicFoundItemById(id);
        setItem(data);
      } catch (err: any) {
        setError(err?.message || 'Found item not found');
      } finally {
        setLoading(false);
      }
    }

    loadItem();
  }, [id]);

  const formattedDate = item?.foundDate
    ? new Date(item.foundDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const isFinder = Boolean(user && item && user.id === item.foundById);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back Link */}
        <Link
          href="/found-items"
          className="inline-flex items-center space-x-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Browse</span>
        </Link>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6 animate-pulse">
            <div className="aspect-[4/3] bg-gray-200 rounded-xl" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        ) : error || !item ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center space-y-4 max-w-md mx-auto my-12">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900">Item Unavailable</h2>
            <p className="text-sm text-gray-600">{error || 'This item is not publicly accessible.'}</p>
            <Link
              href="/found-items"
              className="inline-block px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Inventory
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
            {/* Gallery View */}
            <div>
              <FoundItemGallery images={item.publicImages} title={item.title} />
            </div>

            {/* Item Information */}
            <div className="flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                    {item.category.replace('_', ' ')}
                  </span>
                  <FoundItemStatusBadge status={item.status} />
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {item.title}
                </h1>

                {/* Meta details */}
                <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                    <span><strong>Found Location:</strong> {item.foundLocation}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                    <span><strong>Found Date:</strong> {formattedDate}</span>
                  </div>
                </div>

                {/* Public Description */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    Public Description
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {item.publicDescription}
                  </p>
                </div>
              </div>

              {/* Security Banner & Claim Call-To-Action */}
              <div className="pt-6 border-t border-gray-100 space-y-4">
                <div className="flex items-start space-x-2.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Ownership Security:</strong> Sensitive serial numbers, hidden marks, and verification details are kept private to protect legitimate owners.
                  </span>
                </div>

                {claimSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl text-sm flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold">Claim Submitted Successfully!</p>
                      <p className="text-xs">You can track your claim status under <Link href="/claims" className="underline font-semibold">My Claims</Link>.</p>
                    </div>
                  </div>
                )}

                {item.status === ItemStatus.APPROVED && !claimSuccess && (
                  <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center space-x-1.5 text-blue-900 text-sm font-bold">
                      <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                      <h4>Is this your lost item?</h4>
                    </div>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      Submit private evidence stating why you believe this item belongs to you. Campus moderators will review your evidence.
                    </p>

                    {isFinder ? (
                      <div className="p-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs text-center font-medium">
                        You reported this found item. You cannot claim your own item.
                      </div>
                    ) : user ? (
                      <button
                        onClick={() => setIsClaimModalOpen(true)}
                        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Claim This Item</span>
                      </button>
                    ) : (
                      <Link
                        href={`/login?redirect=/found-items/${id}`}
                        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
                      >
                        <span>Sign In to Claim Item</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {item && (
        <ClaimModal
          foundItemId={item.id}
          itemTitle={item.title}
          isOpen={isClaimModalOpen}
          onClose={() => setIsClaimModalOpen(false)}
          onSuccess={() => setClaimSuccess(true)}
        />
      )}
    </div>
  );
}
