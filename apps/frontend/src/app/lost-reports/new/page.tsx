"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { ImageUpload } from '@/components/ImageUpload';
import { createLostReport } from '@/lib/lostReportsApi';
import { useUser } from '@/lib/useUser';
import { UploadedImage } from '@/lib/cloudinary';
import { ItemCategory } from '@findora/types';
import { ShieldAlert, ArrowLeft, Loader2, AlertCircle, FileText, Lock, Camera } from 'lucide-react';

export default function NewLostReportPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>(ItemCategory.ELECTRONICS);
  const [description, setDescription] = useState('');
  const [lostLocation, setLostLocation] = useState('');
  const [lostDate, setLostDate] = useState('');
  const [identifyingCharacteristics, setIdentifyingCharacteristics] = useState('');
  const [images, setImages] = useState<UploadedImage[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim() || !lostLocation.trim() || !lostDate) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const imageUrls = images.map((img) => img.url);

      const report = await createLostReport({
        title,
        category,
        description,
        lostLocation,
        lostDate: new Date(lostDate).toISOString(),
        identifyingCharacteristics: identifyingCharacteristics || undefined,
        images: imageUrls,
      });

      router.push(`/lost-reports/${report.id}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit lost report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        {/* Security Notice */}
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 sm:p-5 rounded-2xl flex items-start space-x-3 text-xs sm:text-sm">
          <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-950">Private Lost Item Report</h4>
            <p className="text-amber-800 leading-relaxed">
              Lost Reports are strictly private and used to help campus staff verify ownership when matching with found items. This report will <strong>never</strong> be published on the public inventory.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center space-x-2 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section A: Item Details */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 text-gray-900">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-base">Section A: Item Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-gray-700">Item Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Black Sony Noise Canceling Headphones"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ItemCategory)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                >
                  {Object.values(ItemCategory).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Date Misplaced *</label>
                <input
                  type="date"
                  required
                  value={lostDate}
                  onChange={(e) => setLostDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-gray-700">Estimated Lost Location *</label>
                <input
                  type="text"
                  required
                  value={lostLocation}
                  onChange={(e) => setLostLocation(e.target.value)}
                  placeholder="e.g. Science Complex Room 204 or Main Library 3rd Floor"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-gray-700">Detailed Description *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the lost item in detail (color, brand, model, condition)..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section B: Identifying Characteristics */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 text-gray-900">
              <ShieldAlert className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-base">Section B: Secret Identification (Private)</h2>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">
                Unique Identifying Characteristics / Serial Number (Optional)
              </label>
              <textarea
                rows={3}
                value={identifyingCharacteristics}
                onChange={(e) => setIdentifyingCharacteristics(e.target.value)}
                placeholder="Mention any unique stickers, scratches, wallpaper, serial numbers, or internal markings that only you know..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              <p className="text-xs text-gray-500">
                This information is stored securely and used by moderators to verify item claims.
              </p>
            </div>
          </div>

          {/* Section C: Item Photos */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 text-gray-900">
              <Camera className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-base">Section C: Item Reference Photos (Optional)</h2>
            </div>

            <ImageUpload onImagesChange={(uploaded) => setImages(uploaded)} maxFiles={5} />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
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
                  <span>Filing Report...</span>
                </>
              ) : (
                <span>Submit Private Lost Report</span>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
