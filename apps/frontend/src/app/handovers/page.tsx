"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { HandoverStatusBadge } from '@/components/handovers/HandoverStatusBadge';
import { QRScannerModal } from '@/components/handovers/QRScannerModal';
import { getMyHandovers } from '@/lib/handoversApi';
import { Handover } from '@findora/types';
import {
  QrCode,
  Calendar,
  Tag,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function HandoversDashboardPage() {
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchHandovers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyHandovers();
      setHandovers(data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load handover sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandovers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-semibold text-blue-200">
              <QrCode className="w-3.5 h-3.5" />
              <span>Physical Handover Verification</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Item Handovers
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Generate one-time QR codes or scan tokens to complete physical return of claimed campus items.
            </p>
          </div>

          <button
            onClick={() => setIsScannerOpen(true)}
            className="shrink-0 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center space-x-2"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan Handover QR</span>
          </button>
        </div>

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl text-sm flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="font-bold">{successMessage}</p>
          </div>
        )}

        {/* Handovers List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="font-semibold">{error}</p>
          </div>
        ) : handovers.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
            <QrCode className="w-12 h-12 text-gray-400 mx-auto" />
            <h3 className="text-lg font-bold text-gray-900">No Active Handover Sessions</h3>
            <p className="text-sm text-gray-500">
              When an ownership claim is approved by campus moderators, you can generate a handover QR code here.
            </p>
            <Link
              href="/claims"
              className="inline-block px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              View My Claims
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {handovers.map((h) => {
              const item = (h as any).claim?.foundItem;
              return (
                <div
                  key={h.id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                        <Tag className="w-3 h-3 text-gray-500" />
                        <span>{item?.category || 'ITEM'}</span>
                      </span>
                      <HandoverStatusBadge status={h.status} />
                    </div>

                    <h3 className="font-bold text-gray-900 text-base line-clamp-1">
                      {item?.title || 'Handover Session'}
                    </h3>

                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>Created: {new Date(h.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p>Expires: {new Date(h.expiresAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-mono">ID: {h.id.slice(0, 8)}...</span>
                    <Link
                      href={`/handovers/${h.id}`}
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      <span>Open Handover</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSuccess={() => {
          setSuccessMessage('Handover return confirmed successfully!');
          fetchHandovers();
        }}
      />
    </div>
  );
}
