"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { ImageUpload } from '@/components/ImageUpload';
import { getPublicFoundItemById, updateFoundItem } from '@/lib/foundItemsApi';
import { useUser } from '@/lib/useUser';
import { ItemCategory, ItemStatus } from '@findora/types';
import { ArrowLeft, ShieldAlert, Save, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

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

export default function EditFoundItemPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user, loading: authLoading } = useUser();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>(ItemCategory.ELECTRONICS);
  const [publicDescription, setPublicDescription] = useState('');
  const [foundLocation, setFoundLocation] = useState('');
  const [foundDate, setFoundDate] = useState('');
  const [publicImages, setPublicImages] = useState<string[]>([]);

  // Private Verification Info
  const [serialNumber, setSerialNumber] = useState('');
  const [hiddenMarks, setHiddenMarks] = useState('');
  const [privateIdentifyingInfo, setPrivateIdentifyingInfo] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');

  const [currentStatus, setCurrentStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (!id) return;

    async function loadItem() {
      setLoading(true);
      setError(null);
      try {
        const item = await getPublicFoundItemById(id);
        setTitle(item.title);
        setCategory(item.category);
        setPublicDescription(item.publicDescription);
        setFoundLocation(item.foundLocation);
        setFoundDate(
          item.foundDate
            ? new Date(item.foundDate).toISOString().split('T')[0]
            : '',
        );
        setPublicImages(item.publicImages || []);
        setCurrentStatus(item.status);
      } catch (err: any) {
        setError(err?.message || 'Failed to load item details');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadItem();
    }
  }, [id, user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await updateFoundItem(id, {
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
      setError(err?.message || 'Failed to update found item');
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
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
          href="/found-items/my"
          className="inline-flex items-center space-x-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Submissions</span>
        </Link>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-6 sm:p-10 space-y-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Found Item Submission
            </h1>
            <p className="text-sm text-gray-600">
              Update details for your reported item.
            </p>
          </div>

          {currentStatus === ItemStatus.APPROVED && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl flex items-start space-x-3 text-xs sm:text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> Modifying an approved item will return it to pending status for moderator re-approval before it becomes public again.
              </span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-start space-x-3 text-sm">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center space-x-3 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Item updated successfully! Redirecting to your submissions...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Title
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
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
                    Found Date
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
                  Found Location
                </label>
                <input
                  type="text"
                  required
                  maxLength={250}
                  value={foundLocation}
                  onChange={(e) => setFoundLocation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Public Description
                </label>
                <textarea
                  required
                  rows={4}
                  maxLength={2000}
                  value={publicDescription}
                  onChange={(e) => setPublicDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Photos */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Item Photos
              </label>
              <ImageUpload
                onImagesChange={(images) =>
                  setPublicImages(images.map((img) => img.url))
                }
                maxFiles={5}
              />
            </div>

            {/* Private Verification Info */}
            <div className="space-y-4 pt-2 bg-blue-50/60 p-6 rounded-2xl border border-blue-100">
              <div className="border-b border-blue-200 pb-2 flex items-start space-x-2">
                <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Private Verification Information
                  </h2>
                  <p className="text-xs text-blue-800 mt-0.5">
                    Only authorized moderators can access this information.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    maxLength={250}
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
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
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Private Characteristics
                  </label>
                  <input
                    type="text"
                    maxLength={1000}
                    value={privateIdentifyingInfo}
                    onChange={(e) => setPrivateIdentifyingInfo(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Private Notes
                  </label>
                  <textarea
                    rows={2}
                    maxLength={1000}
                    value={privateNotes}
                    onChange={(e) => setPrivateNotes(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3">
              <Link
                href="/found-items/my"
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
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
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
