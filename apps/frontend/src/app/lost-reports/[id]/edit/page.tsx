"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { ImageUpload } from '@/components/ImageUpload';
import { getLostReport, updateLostReport } from '@/lib/lostReportsApi';
import { UploadedImage } from '@/lib/cloudinary';
import { ItemCategory, LostReportStatus } from '@findora/types';
import { ArrowLeft, Loader2, AlertCircle, FileText, Camera, ShieldAlert } from 'lucide-react';

export default function EditLostReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>(ItemCategory.ELECTRONICS);
  const [description, setDescription] = useState('');
  const [lostLocation, setLostLocation] = useState('');
  const [lostDate, setLostDate] = useState('');
  const [identifyingCharacteristics, setIdentifyingCharacteristics] = useState('');
  const [images, setImages] = useState<UploadedImage[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportStatus, setReportStatus] = useState<LostReportStatus>(LostReportStatus.ACTIVE);

  useEffect(() => {
    async function loadReport() {
      try {
        const data = await getLostReport(id);
        setReportStatus(data.status);
        setTitle(data.title);
        setCategory(data.category);
        setDescription(data.description);
        setLostLocation(data.lostLocation);
        setLostDate(new Date(data.lostDate).toISOString().split('T')[0]);
        setIdentifyingCharacteristics(data.identifyingCharacteristics || '');
        if (data.images && data.images.length > 0) {
          setImages(
            data.images.map((url) => ({
              url,
              publicId: url,
              width: 0,
              height: 0,
              format: 'jpg',
              bytes: 0,
            })),
          );
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load lost report.');
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim() || !lostLocation.trim() || !lostDate) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      const imageUrls = images.map((img) => img.url);

      await updateLostReport(id, {
        title,
        category,
        description,
        lostLocation,
        lostDate: new Date(lostDate).toISOString(),
        identifyingCharacteristics: identifyingCharacteristics || undefined,
        images: imageUrls,
      });

      router.push(`/lost-reports/${id}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to update lost report.');
    } finally {
      setSubmitting(false);
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

  if (reportStatus !== LostReportStatus.ACTIVE) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-12">
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-6 rounded-2xl text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <h3 className="font-bold text-lg">Cannot Edit Report</h3>
            <p className="text-sm">
              This report is currently in <strong>{reportStatus}</strong> status and can no longer be edited.
            </p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-amber-700 text-white text-sm font-semibold rounded-xl hover:bg-amber-800 transition-colors"
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel Editing</span>
        </button>

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
              <h2 className="font-bold text-base">Edit Section A: Item Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-gray-700">Item Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section B: Secret Identification */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 text-gray-900">
              <ShieldAlert className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-base">Edit Section B: Secret Identification</h2>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">
                Unique Identifying Characteristics / Serial Number
              </label>
              <textarea
                rows={3}
                value={identifyingCharacteristics}
                onChange={(e) => setIdentifyingCharacteristics(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Section C: Photos */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 text-gray-900">
              <Camera className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-base">Edit Section C: Item Photos</h2>
            </div>

            <ImageUpload onImagesChange={(uploaded) => setImages(uploaded)} maxFiles={5} />
          </div>

          {/* Actions */}
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
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md disabled:opacity-50 inline-flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
