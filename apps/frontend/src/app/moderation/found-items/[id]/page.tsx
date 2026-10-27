"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { ModeratorGuard } from '@/components/moderation/ModeratorGuard';
import { RejectionModal } from '@/components/moderation/RejectionModal';
import { getFoundItemModerationDetail, approveFoundItem, rejectFoundItem, FoundItemModerationDetail } from '@/lib/moderationApi';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Lock,
  Globe,
  User,
  MapPin,
  Calendar,
  Tag,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function FoundItemModerationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [item, setItem] = useState<FoundItemModerationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      setError(null);
      try {
        const data = await getFoundItemModerationDetail(id);
        setItem(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load found item moderation details');
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this found item and publish it to the public inventory?')) return;

    setApproving(true);
    try {
      await approveFoundItem(id);
      alert('Found item approved successfully!');
      router.push('/moderation/found-items');
    } catch (err: any) {
      alert(err?.message || 'Failed to approve item.');
    } finally {
      setApproving(false);
    }
  };

  const handleConfirmReject = async (reason: string) => {
    await rejectFoundItem(id, reason);
    alert('Found item rejected successfully.');
    router.push('/moderation/found-items');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <ModeratorGuard>
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Link
            href="/moderation/found-items"
            className="inline-flex items-center space-x-1 text-xs font-semibold text-gray-600 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Pending Found Items</span>
          </Link>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : error || !item ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <p className="font-semibold">{error || 'Item not found'}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top Banner & Review Actions */}
              <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                      STATUS: {item.status}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">ID: {item.id}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{item.title}</h1>
                </div>

                {item.status === 'PENDING' && (
                  <div className="flex items-center space-x-3 shrink-0">
                    <button
                      onClick={() => setIsRejectionModalOpen(true)}
                      className="px-4 py-2.5 border border-red-300 text-red-700 hover:bg-red-50 font-semibold text-xs rounded-xl transition-colors inline-flex items-center space-x-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Item</span>
                    </button>

                    <button
                      onClick={handleApprove}
                      disabled={approving}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-md inline-flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      {approving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>Approve & Publish</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 🌐 SECTION 1: PUBLIC ITEM INFORMATION */}
              <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 text-blue-900">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <h2 className="text-sm font-extrabold tracking-wide uppercase">
                    Public Information (Visible to Students)
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="space-y-1">
                    <span className="text-gray-500 font-semibold block">Category</span>
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-gray-100 text-gray-800 font-medium">
                      <Tag className="w-3 h-3 text-gray-500" />
                      <span>{item.category}</span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-gray-500 font-semibold block">Found Location</span>
                    <span className="flex items-center space-x-1 font-medium text-gray-900">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{item.foundLocation}</span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-gray-500 font-semibold block">Found Date</span>
                    <span className="flex items-center space-x-1 font-medium text-gray-900">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{new Date(item.foundDate).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <span className="text-xs text-gray-500 font-semibold block">Public Description</span>
                  <p className="text-sm text-gray-800 bg-gray-50 p-4 rounded-2xl border border-gray-100 whitespace-pre-line leading-relaxed">
                    {item.publicDescription}
                  </p>
                </div>
              </div>

              {/* 🔒 SECTION 2: PRIVATE FINDER VERIFICATION INFORMATION */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-amber-200/80 pb-3 text-amber-950">
                  <Lock className="w-5 h-5 text-amber-600" />
                  <h2 className="text-sm font-extrabold tracking-wide uppercase">
                    Private Finder Verification (Staff Confidential)
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  {item.verification?.serialNumber && (
                    <div className="space-y-1">
                      <span className="text-amber-900/70 font-semibold block">Serial Number</span>
                      <span className="font-mono bg-white px-3 py-1 rounded-lg border border-amber-200 text-gray-900 font-bold block">
                        {item.verification.serialNumber}
                      </span>
                    </div>
                  )}

                  {item.verification?.hiddenMarks && (
                    <div className="space-y-1">
                      <span className="text-amber-900/70 font-semibold block">Hidden / Secret Marks</span>
                      <span className="font-medium text-gray-900 block bg-white p-2 rounded-lg border border-amber-200">
                        {item.verification.hiddenMarks}
                      </span>
                    </div>
                  )}

                  {item.verification?.internalContents && (
                    <div className="space-y-1 sm:col-span-2">
                      <span className="text-amber-900/70 font-semibold block">Internal Contents</span>
                      <span className="font-medium text-gray-900 block bg-white p-3 rounded-lg border border-amber-200 whitespace-pre-line">
                        {item.verification.internalContents}
                      </span>
                    </div>
                  )}

                  {item.verification?.privateNotes && (
                    <div className="space-y-1 sm:col-span-2">
                      <span className="text-amber-900/70 font-semibold block">Finder Private Notes</span>
                      <span className="font-medium text-gray-900 block bg-white p-3 rounded-lg border border-amber-200 whitespace-pre-line">
                        {item.verification.privateNotes}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 👤 SECTION 3: FINDER CONTACT INFORMATION */}
              <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
                <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 text-gray-900">
                  <User className="w-5 h-5 text-gray-600" />
                  <h2 className="text-sm font-extrabold tracking-wide uppercase">
                    Finder Profile & Contact
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-gray-500 font-semibold block">Username</span>
                    <span className="font-bold text-gray-900">{item.foundBy?.username || 'Anonymous Finder'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-semibold block">Email</span>
                    <span className="text-gray-900">{item.foundBy?.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-semibold block">Roll No / Dept</span>
                    <span className="text-gray-900">{item.foundBy?.rollNo || 'N/A'} ({item.foundBy?.department || 'N/A'})</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <RejectionModal
            title="Reject Found Item"
            isOpen={isRejectionModalOpen}
            onClose={() => setIsRejectionModalOpen(false)}
            onConfirm={handleConfirmReject}
          />
        </main>
      </ModeratorGuard>
    </div>
  );
}
