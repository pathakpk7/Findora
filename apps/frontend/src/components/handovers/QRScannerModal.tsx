"use client";

import { useState } from 'react';
import { scanHandover } from '@/lib/handoversApi';
import { X, QrCode, Loader2, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function QRScannerModal({
  isOpen,
  onClose,
  onSuccess,
}: QRScannerModalProps) {
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tokenInput.trim()) {
      setError('Please scan or enter the handover token.');
      return;
    }

    setLoading(true);

    try {
      await scanHandover(tokenInput.trim());
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to scan and complete handover.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-xs font-semibold text-blue-800">
            <QrCode className="w-3.5 h-3.5" />
            <span>Handover Verification Scanner</span>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">
            Confirm Item Handover
          </h2>
        </div>

        {/* Informational Banner */}
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs space-y-1">
          <div className="flex items-center space-x-1 font-bold text-amber-950">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Physical Handover Authorization</span>
          </div>
          <p className="leading-relaxed">
            Scan the student&apos;s handover QR code or enter their one-time handover token. Scanning this token confirms that physical return of the item has taken place.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl flex items-center space-x-2 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-800 block">
              Handover Opaque Token / QR String *
            </label>
            <input
              type="text"
              required
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Scan QR or paste 64-character token hex..."
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            <p className="text-xs text-gray-500">
              The token is a secure one-time string generated during the handover session.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md disabled:opacity-50 inline-flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Token...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Handover Return</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
