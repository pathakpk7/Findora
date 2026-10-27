"use client";

import { useState } from 'react';
import { createClaim } from '@/lib/claimsApi';
import { X, ShieldAlert, Loader2, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

interface ClaimModalProps {
  foundItemId: string;
  itemTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ClaimModal({
  foundItemId,
  itemTitle,
  isOpen,
  onClose,
  onSuccess,
}: ClaimModalProps) {
  const [evidence, setEvidence] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (evidence.trim().length < 10) {
      setError('Evidence statement must be at least 10 characters long.');
      return;
    }

    setLoading(true);

    try {
      await createClaim({
        foundItemId,
        evidence: evidence.trim(),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit claim. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-xs font-semibold text-amber-800">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Private Ownership Verification</span>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">
            Claim &quot;{itemTitle}&quot;
          </h2>
        </div>

        {/* Security Warning Notice */}
        <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded-2xl text-xs space-y-1">
          <div className="flex items-center space-x-1 font-bold text-blue-950">
            <Lock className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Strict Privacy Protection</span>
          </div>
          <p className="leading-relaxed">
            Your evidence statement is kept <strong>strictly private</strong> and evaluated only by authorized campus moderators. The person who found this item will never see your evidence.
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
              Private Ownership Evidence *
            </label>
            <textarea
              required
              rows={4}
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="State unique facts proving ownership (e.g. wallpaper picture, serial number, internal contents, exact location/time lost, distinguishing marks)..."
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            <p className="text-xs text-gray-500">
              Provide specific details that only the true owner would know. Minimum 10 characters.
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
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Private Claim</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
