"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { ClaimStatusBadge } from '@/components/claims/ClaimStatusBadge';
import { getClaim, cancelClaim } from '@/lib/claimsApi';
import { Claim, ClaimStatus } from '@findora/types';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  Lock,
  XCircle,
  Loader2,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function ClaimDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function loadClaim() {
      try {
        const data = await getClaim(id);
        setClaim(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load claim details.');
      } finally {
        setLoading(false);
      }
    }
    loadClaim();
  }, [id]);

  const handleCancelClaim = async () => {
    if (!confirm('Are you sure you want to cancel this claim?')) return;
    setCancelling(true);
    try {
      const updated = await cancelClaim(id);
      setClaim(updated);
    } catch (err: any) {
      alert(err?.message || 'Failed to cancel claim');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </main>
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <h3 className="font-bold text-lg">Claim Not Found</h3>
            <p className="text-sm">{error || 'This claim does not exist or you do not have permission to view it.'}</p>
            <Link
              href="/claims"
              className="inline-block px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors"
            >
              Back to My Claims
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const foundItem = (claim as any).foundItem;

  const formattedDate = new Date(claim.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Claims</span>
        </button>

        {/* Header Container */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 font-semibold">Claim ID: {claim.id.slice(0, 8)}...</span>
                <ClaimStatusBadge status={claim.status} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Claim for &quot;{foundItem?.title || 'Found Item'}&quot;
              </h1>
            </div>

            {claim.status === ClaimStatus.PENDING && (
              <button
                onClick={handleCancelClaim}
                disabled={cancelling}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold rounded-xl transition-colors inline-flex items-center space-x-1.5 disabled:opacity-50 shrink-0"
              >
                {cancelling ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                <span>Cancel Claim</span>
              </button>
            )}
          </div>

          {/* Privacy Security Banner */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-center space-x-3 text-xs text-amber-900">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              Your claim details and evidence statement are private. Only authorized campus moderators can view this statement to verify your ownership.
            </span>
          </div>

          {/* Target Found Item Card Preview */}
          {foundItem && (
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Target Found Item</span>
                <Link
                  href={`/found-items/${foundItem.id}`}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  View Public Details &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="space-y-1">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-800">
                    <Tag className="w-3 h-3 text-gray-500" />
                    <span>{foundItem.category}</span>
                  </span>
                  <p className="font-bold text-gray-900">{foundItem.title}</p>
                  <p className="text-gray-600 text-xs line-clamp-2">{foundItem.publicDescription}</p>
                </div>

                <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-gray-200 pt-2 sm:pt-0 sm:pl-4 text-xs text-gray-600">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>Location: {foundItem.foundLocation}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>Filed on: {formattedDate}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submitted Evidence Statement */}
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-900">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <h3>Your Private Evidence Statement</h3>
            </div>
            <p className="text-sm text-gray-800 bg-amber-50/40 p-4 rounded-2xl border border-amber-100 whitespace-pre-line leading-relaxed">
              {claim.evidence}
            </p>
          </div>

          {/* Moderator Review Notes / Reason if set */}
          {claim.reviewReason && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h3 className="text-xs font-bold text-gray-900">Moderator Review Notes</h3>
              <div className={`p-4 rounded-2xl border text-xs sm:text-sm ${
                claim.status === ClaimStatus.APPROVED
                  ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
                  : 'bg-red-50 text-red-950 border-red-200'
              }`}>
                <div className="flex items-center space-x-2 font-semibold mb-1">
                  {claim.status === ClaimStatus.APPROVED ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>Status: {claim.status}</span>
                </div>
                <p className="whitespace-pre-line">{claim.reviewReason}</p>
              </div>
            </div>
          )}

          {/* Handover CTA when APPROVED */}
          {claim.status === ClaimStatus.APPROVED && (
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white space-y-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1 bg-blue-500/20 text-blue-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Ownership Verified</span>
                </div>
                <h3 className="font-extrabold text-lg">Ready for Physical Handover</h3>
                <p className="text-xs text-blue-200">
                  Your claim has been approved! Generate your one-time handover QR code to present during item return.
                </p>
              </div>
              <Link
                href="/handovers"
                className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold text-xs rounded-xl transition-all shadow-md shrink-0 text-center"
              >
                Go to Handovers &rarr;
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
