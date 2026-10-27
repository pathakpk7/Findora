"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { ImageUpload } from '@/components/ImageUpload';
import { createFoundItem } from '@/lib/foundItemsApi';
import { useUser } from '@/lib/useUser';
import { ItemCategory } from '@findora/types';
import { ArrowLeft, ShieldAlert, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

const CATEGORIES = [
  { label: 'Electronics', value: ItemCategory.ELECTRONICS },
  { label: 'Phones', value: ItemCategory.PHONE },
  { label: 'Earbuds & Audio', value: ItemCategory.EARBUDS },
  { label: 'Watches', value: ItemCategory.WATCH },
  { label: 'Wallets', value: ItemCategory.WALLET },
  { label: 'Cash', value: ItemCategory.CASH },
  { label: 'Books', value: ItemCategory.BOOK },
  { label: 'Notebooks', value: ItemCategory.NOTEBOOK },
  { label: 'ID Cards', value: ItemCategory.ID_CARD },
  { label: 'Student Cards', value: ItemCategory.STUDENT_CARD },
  { label: 'Keys', value: ItemCategory.KEYS },
  { label: 'Bags & Backpacks', value: ItemCategory.BAG },
  { label: 'Clothing', value: ItemCategory.CLOTHING },
  { label: 'Accessories', value: ItemCategory.ACCESSORY },
  { label: 'Chargers & Cables', value: ItemCategory.CHARGER },
  { label: 'Other', value: ItemCategory.OTHER },
];

export default function CreateFoundItemPage() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();

  // Form State - Section A: Public Info
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>(ItemCategory.ELECTRONICS);
  const [publicDescription, setPublicDescription] = useState('');
  const [foundLocation, setFoundLocation] = useState('');
  const [foundDate, setFoundDate] = useState(
    new Date().toISOString().split('T')[0],
  );

  // Section B: Photos
  const [publicImages, setPublicImages] = useState<string[]>([]);

  // Section C: Private Verification Info
  const [serialNumber, setSerialNumber] = useState('');
  const [hiddenMarks, setHiddenMarks] = useState('');
  const [privateIdentifyingInfo, setPrivateIdentifyingInfo] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');

  // UI State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await createFoundItem({
        title: title.trim(),
        category,
        publicDescription: publicDescription.trim(),
        foundLocation: foundLocation.trim(),
        foundDate,
        publicImages,
        serialNumber: serialNumber.trim() || undefined,
        hiddenMarks: hiddenMarks.trim() || undefined,
        privateIdentifyingInfo: privateIdentifyingInfo.trim() || undefined,
        privateNotes: privateNotes.trim() || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/found-items/my');
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit found item');
      setSubmitting(false);
    }
  };

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

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Link
          href="/found-items"
          className="inline-flex items-center space-x-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Browse</span>
        </Link>

        {/* Form Container */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-6 sm:p-10 space-y-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Report a Found Item
            </h1>
            <p className="text-sm text-gray-600">
              Help return a lost item to its rightful owner. Submissions are reviewed by campus moderators before publishing.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-start space-x-3 text-sm">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center space-x-3 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Found item submitted successfully! Redirecting to your submissions...
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* SECTION A — PUBLIC ITEM INFORMATION */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-gray-200 pb-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  Section A — Public Item Information
                </h2>
                <p className="text-xs text-gray-500">
                  Visible to students browsing Findora inventory.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={150}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Sony Wireless Earbuds (Black)"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ItemCategory)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Found Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={foundDate}
                      onChange={(e) => setFoundDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Found Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={250}
                    value={foundLocation}
                    onChange={(e) => setFoundLocation(e.target.value)}
                    placeholder="e.g. Main Library 2nd Floor Study Room 204"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Public Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    maxLength={2000}
                    value={publicDescription}
                    onChange={(e) => setPublicDescription(e.target.value)}
                    placeholder="Describe the item's general appearance (color, brand, condition). Do not enter passwords or sensitive personal details."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* SECTION B — PHOTOS */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-gray-200 pb-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  Section B — Photos
                </h2>
                <p className="text-xs text-gray-500">
                  Upload clear photos of the found item.
                </p>
              </div>

              <ImageUpload
                onImagesChange={(images) =>
                  setPublicImages(images.map((img) => img.url))
                }
                maxFiles={5}
              />
            </div>

            {/* SECTION C — PRIVATE VERIFICATION INFORMATION */}
            <div className="space-y-4 pt-2 bg-blue-50/60 p-6 rounded-2xl border border-blue-100">
              <div className="border-b border-blue-200 pb-2 flex items-start space-x-2">
                <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Section C — Private Verification Information
                  </h2>
                  <p className="text-xs text-blue-800 mt-0.5">
                    <strong>Notice:</strong> Private verification information is used ONLY by authorized moderators to verify ownership claims. It is never displayed publicly.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serial Number (if applicable)
                  </label>
                  <input
                    type="text"
                    maxLength={250}
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g. S/N 987654321"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hidden Marks or Scratches
                  </label>
                  <input
                    type="text"
                    maxLength={1000}
                    value={hiddenMarks}
                    onChange={(e) => setHiddenMarks(e.target.value)}
                    placeholder="e.g. Small star sticker inside case lid, small scratch on left hinge"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Private Characteristics / Lock Screen Wallpaper
                  </label>
                  <input
                    type="text"
                    maxLength={1000}
                    value={privateIdentifyingInfo}
                    onChange={(e) => setPrivateIdentifyingInfo(e.target.value)}
                    placeholder="e.g. Phone wallpaper is a golden retriever, case has student initials 'J.D.'"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Private Notes for Moderator
                  </label>
                  <textarea
                    rows={2}
                    maxLength={1000}
                    value={privateNotes}
                    onChange={(e) => setPrivateNotes(e.target.value)}
                    placeholder="Any additional private notes for campus moderation review."
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex items-center justify-end space-x-3">
              <Link
                href="/found-items"
                className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || success}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Submit Item</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
