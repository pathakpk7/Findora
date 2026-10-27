"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { HandoverStatusBadge } from '@/components/handovers/HandoverStatusBadge';
import { QRCodeDisplay } from '@/components/handovers/QRCodeDisplay';
import { QRScannerModal } from '@/components/handovers/QRScannerModal';
import { getHandover, createHandover, cancelHandover } from '@/lib/handoversApi';
import { Handover, HandoverStatus } from '@findora/types';
import {
  ArrowLeft,
  QrCode,
  Calendar,
  Tag,
  MapPin,
  XCircle,
  Loader2,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  User,
} from 'lucide-react';

export default function HandoverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [handover, setHandover] = useState<Handover | null>(null);
  const [rawToken, setRawToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [generatingToken, setGeneratingToken] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadHandover = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHandover(id);
      setHandover(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load handover details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHandover();
  }, [id]);

  const handleRegenerateQR = async () => {
    if (!handover?.claimId) return;
    setGeneratingToken(true);
    try {
      const res = await createHandover(handover.claimId);
      setHandover(res);
      if (res.rawToken) {
        setRawToken(res.rawToken);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to generate handover QR token.');
    } finally {
      setGeneratingToken(false);
    }
  };

  const handleCancelHandover = async () => {
    if (!confirm('Are you sure you want to cancel this handover session?')) return;
    setCancelling(true);
    try {
      const updated = await cancelHandover(id);
      setHandover(updated);
      setRawToken(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to cancel handover session.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </main>
      </div>
    );
  }

  if (error || !handover) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <h3 className="font-bold text-lg">Handover Not Found</h3>
            <p className="text-sm">{error || 'This handover session does not exist or access is forbidden.'}</p>
            <Link
              href="/handovers"
              className="inline-block px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors"
            >
              Back to Handovers
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const claim = (handover as any).claim;
  const foundItem = claim?.foundItem;
  const claimant = claim?.claimant;

  const isCompleted = handover.status === HandoverStatus.COMPLETED;
  const isExpired = handover.status === HandoverStatus.EXPIRED || new Date() > new Date(handover.expiresAt);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Handovers</span>
        </button>

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl text-sm flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="font-bold">{successMessage}</p>
          </div>
        )}

        {/* Header Container */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 font-semibold">Handover ID: {handover.id.slice(0, 8)}...</span>
                <HandoverStatusBadge status={handover.status} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Handover for &quot;{foundItem?.title || 'Found Item'}&quot;
              </h1>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              {handover.status === HandoverStatus.PENDING && !isExpired && (
                <button
                  onClick={handleCancelHandover}
                  disabled={cancelling}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold rounded-xl transition-colors inline-flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>Cancel Session</span>
                </button>
              )}

              {(!isCompleted) && (
                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all shadow-md inline-flex items-center space-x-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Scan Token & Confirm</span>
                </button>
              )}
            </div>
          </div>

          {/* QR Code Presentation Section */}
          {!isCompleted && !isExpired && (
            <div className="bg-gradient-to-b from-gray-50 to-blue-50/40 rounded-3xl p-6 sm:p-8 border border-blue-100 text-center space-y-4">
              <div className="inline-flex items-center space-x-1.5 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>One-Time Handover Token</span>
              </div>

              {rawToken ? (
                <div className="space-y-4">
                  <QRCodeDisplay value={rawToken} size={220} />
                  <p className="text-xs text-gray-600 font-mono bg-white px-3 py-1.5 rounded-lg border border-gray-200 inline-block">
                    Token: {rawToken.slice(0, 16)}...
                  </p>
                </div>
              ) : (
                <div className="space-y-3 py-4 max-w-sm mx-auto">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Click below to generate an active one-time QR code for this handover session.
                  </p>
                  <button
                    onClick={handleRegenerateQR}
                    disabled={generatingToken}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm inline-flex items-center space-x-2 disabled:opacity-50"
                  >
                    {generatingToken ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    <span>Generate Active QR Code</span>
                  </button>
                </div>
              )}

              <p className="text-xs text-gray-500">
                Expires on: {new Date(handover.expiresAt).toLocaleString()}
              </p>
            </div>
          )}

          {isCompleted && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-6 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-extrabold">Handover Completed & Confirmed</h3>
              <p className="text-xs text-emerald-800">
                The item has been returned to its owner and this handover session is completed.
              </p>
            </div>
          )}

          {/* Item Metadata Preview */}
          {foundItem && (
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Item Details</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="space-y-1">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-800">
                    <Tag className="w-3 h-3 text-gray-500" />
                    <span>{foundItem.category}</span>
                  </span>
                  <p className="font-bold text-gray-900">{foundItem.title}</p>
                </div>

                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>Location: {foundItem.foundLocation}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Found Date: {new Date(foundItem.foundDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Participant Profiles */}
          {claimant && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-2 text-xs sm:text-sm">
              <div className="flex items-center space-x-1.5 font-bold text-gray-900 pb-2 border-b border-gray-100">
                <User className="w-4 h-4 text-blue-600" />
                <span>Verified Owner (Claimant)</span>
              </div>
              <p className="text-gray-800 font-semibold">{claimant.firstName ? `${claimant.firstName} ${claimant.lastName || ''}` : claimant.username}</p>
              <p className="text-gray-500 font-mono text-xs">{claimant.email}</p>
            </div>
          )}
        </div>
      </main>

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSuccess={() => {
          setSuccessMessage('Handover return confirmed successfully!');
          loadHandover();
        }}
      />
    </div>
  );
}
