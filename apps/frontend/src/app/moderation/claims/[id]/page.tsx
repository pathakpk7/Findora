"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { ModeratorGuard } from '@/components/moderation/ModeratorGuard';
import { RejectionModal } from '@/components/moderation/RejectionModal';
import { getClaimModerationDetail, reviewClaim, ClaimModerationDetail } from '@/lib/moderationApi';
import { ClaimStatus } from '@findora/types';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Lock,
  Globe,
  User,
  ShieldAlert,
  Loader2,
  AlertCircle,
  Tag,
  MapPin,
} from 'lucide-react';

export default function ClaimModerationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [claim, setClaim] = useState<ClaimModerationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      setError(null);
      try {
        const data = await getClaimModerationDetail(id);
        setClaim(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load claim moderation details');
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  const handleApproveClaim = async () => {
    if (!confirm('Are you sure you want to approve this claim? This will mark the Found Item as CLAIMED and reject competing claims.')) return;

    setApproving(true);
    try {
      await reviewClaim(id, { status: ClaimStatus.APPROVED });
      alert('Claim approved successfully!');
      router.push('/moderation/claims');
    } catch (err: any) {
      alert(err?.message || 'Failed to approve claim.');
    } finally {
      setApproving(false);
    }
  };

  const handleConfirmReject = async (reason: string) => {
    await reviewClaim(id, { status: ClaimStatus.REJECTED, reviewReason: reason });
    alert('Claim rejected successfully.');
    router.push('/moderation/claims');
  };

  const foundItem = claim?.foundItem;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <ModeratorGuard>
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Link
            href="/moderation/claims"
            className="inline-flex items-center space-x-1 text-xs font-semibold text-gray-600 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Pending Claims</span>
          </Link>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : error || !claim ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <p className="font-semibold">{error || 'Claim not found'}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Banner & Review Actions */}
              <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                      CLAIM STATUS: {claim.status}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">Claim ID: {claim.id}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                    Claim Evaluation for &quot;{foundItem?.title || 'Found Item'}&quot;
                  </h1>
                </div>

                {claim.status === ClaimStatus.PENDING && (
                  <div className="flex items-center space-x-3 shrink-0">
                    <button
                      onClick={() => setIsRejectionModalOpen(true)}
                      className="px-4 py-2.5 border border-red-300 text-red-700 hover:bg-red-50 font-semibold text-xs rounded-xl transition-colors inline-flex items-center space-x-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Claim</span>
                    </button>

                    <button
                      onClick={handleApproveClaim}
                      disabled={approving}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-md inline-flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      {approving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>Approve Claim</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 🛡️ SECTION 1: CLAIMANT'S PRIVATE EVIDENCE STATEMENT */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-amber-200 pb-3 text-amber-950">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                  <h2 className="text-sm font-extrabold tracking-wide uppercase">
                    Claimant Private Evidence Statement (Staff Confidential)
                  </h2>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-amber-950 bg-white p-4 rounded-2xl border border-amber-200 whitespace-pre-line leading-relaxed">
                    {claim.evidence}
                  </p>
                  <p className="text-xs text-amber-800">
                    Submitted on: {new Date(claim.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* 🔒 SECTION 2: FINDER'S PRIVATE VERIFICATION DETAILS */}
              {foundItem?.verification && (
                <div className="bg-purple-50/70 border border-purple-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                  <div className="flex items-center space-x-2 border-b border-purple-200 pb-3 text-purple-950">
                    <Lock className="w-5 h-5 text-purple-600" />
                    <h2 className="text-sm font-extrabold tracking-wide uppercase">
                      Finder Private Verification Details (Staff Confidential)
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                    {foundItem.verification.serialNumber && (
                      <div className="space-y-1">
                        <span className="text-purple-900/70 font-semibold block">Finder Serial Number Record</span>
                        <span className="font-mono bg-white px-3 py-1 rounded-lg border border-purple-200 text-gray-900 font-bold block">
                          {foundItem.verification.serialNumber}
                        </span>
                      </div>
                    )}

                    {foundItem.verification.hiddenMarks && (
                      <div className="space-y-1">
                        <span className="text-purple-900/70 font-semibold block">Finder Hidden Marks Record</span>
                        <span className="font-medium text-gray-900 block bg-white p-2 rounded-lg border border-purple-200">
                          {foundItem.verification.hiddenMarks}
                        </span>
                      </div>
                    )}

                    {foundItem.verification.internalContents && (
                      <div className="space-y-1 sm:col-span-2">
                        <span className="text-purple-900/70 font-semibold block">Finder Internal Contents Record</span>
                        <span className="font-medium text-gray-900 block bg-white p-3 rounded-lg border border-purple-200 whitespace-pre-line">
                          {foundItem.verification.internalContents}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 🌐 SECTION 3: TARGET FOUND ITEM PUBLIC METADATA */}
              {foundItem && (
                <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                  <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 text-gray-900">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <h2 className="text-sm font-extrabold tracking-wide uppercase">
                      Target Found Item Public Details
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-500 font-semibold block">Item Title</span>
                      <span className="font-bold text-gray-900">{foundItem.title}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold block">Category</span>
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-gray-100 text-gray-800 font-medium">
                        <Tag className="w-3 h-3 text-gray-500" />
                        <span>{foundItem.category}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold block">Found Location</span>
                      <span className="flex items-center space-x-1 font-medium text-gray-900">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{foundItem.foundLocation}</span>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 pt-2">
                    <span className="text-xs text-gray-500 font-semibold block">Public Description</span>
                    <p className="text-sm text-gray-800 bg-gray-50 p-4 rounded-2xl border border-gray-100 whitespace-pre-line leading-relaxed">
                      {foundItem.publicDescription}
                    </p>
                  </div>
                </div>
              )}

              {/* 👤 SECTION 4: CLAIMANT AND FINDER PROFILES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Claimant Profile */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-3">
                  <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 text-amber-900">
                    <User className="w-5 h-5 text-amber-600" />
                    <h2 className="text-xs font-extrabold tracking-wide uppercase">
                      Claimant Profile & Contact
                    </h2>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm text-gray-700">
                    <div>
                      <span className="text-gray-400 block text-xs">Full Name / Username</span>
                      <span className="font-bold text-gray-900">
                        {claim.claimant?.firstName ? `${claim.claimant.firstName} ${claim.claimant.lastName || ''}` : claim.claimant?.username}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs">Email</span>
                      <span className="text-gray-900 font-mono">{claim.claimant?.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs">Roll No / Department</span>
                      <span className="text-gray-900">{claim.claimant?.rollNo || 'N/A'} ({claim.claimant?.department || 'N/A'})</span>
                    </div>
                  </div>
                </div>

                {/* Finder Profile */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-3">
                  <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 text-purple-900">
                    <User className="w-5 h-5 text-purple-600" />
                    <h2 className="text-xs font-extrabold tracking-wide uppercase">
                      Finder Profile & Contact
                    </h2>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm text-gray-700">
                    <div>
                      <span className="text-gray-400 block text-xs">Full Name / Username</span>
                      <span className="font-bold text-gray-900">
                        {foundItem?.foundBy?.firstName ? `${foundItem.foundBy.firstName} ${foundItem.foundBy.lastName || ''}` : foundItem?.foundBy?.username || 'Anonymous'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs">Email</span>
                      <span className="text-gray-900 font-mono">{foundItem?.foundBy?.email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs">Roll No / Department</span>
                      <span className="text-gray-900">{foundItem?.foundBy?.rollNo || 'N/A'} ({foundItem?.foundBy?.department || 'N/A'})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <RejectionModal
            title="Reject Ownership Claim"
            isOpen={isRejectionModalOpen}
            onClose={() => setIsRejectionModalOpen(false)}
            onConfirm={handleConfirmReject}
          />
        </main>
      </ModeratorGuard>
    </div>
  );
}
