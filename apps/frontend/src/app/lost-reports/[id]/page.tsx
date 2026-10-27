"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { LostReportStatusBadge } from '@/components/lost-reports/LostReportStatusBadge';
import { getLostReport, changeLostReportStatus } from '@/lib/lostReportsApi';
import { LostReport, LostReportStatus } from '@findora/types';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  Lock,
  Edit,
  XCircle,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export default function LostReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [report, setReport] = useState<LostReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    async function loadReport() {
      try {
        const data = await getLostReport(id);
        setReport(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load lost report details.');
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [id]);

  const handleCancelReport = async () => {
    if (!confirm('Are you sure you want to cancel this lost report?')) return;
    setStatusUpdating(true);
    try {
      const updated = await changeLostReportStatus(id, LostReportStatus.CANCELLED);
      setReport(updated);
    } catch (err: any) {
      alert(err?.message || 'Failed to cancel lost report');
    } finally {
      setStatusUpdating(false);
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

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <h3 className="font-bold text-lg">Report Not Found</h3>
            <p className="text-sm">{error || 'This lost report does not exist or you do not have permission to view it.'}</p>
            <Link
              href="/lost-reports"
              className="inline-block px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors"
            >
              Back to My Lost Reports
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const formattedDate = new Date(report.lostDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lost Reports</span>
        </button>

        {/* Header Container */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
                  <Tag className="w-3 h-3 text-gray-500" />
                  <span>{report.category}</span>
                </span>
                <LostReportStatusBadge status={report.status} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {report.title}
              </h1>
            </div>

            {/* Actions for ACTIVE report */}
            {report.status === LostReportStatus.ACTIVE && (
              <div className="flex items-center space-x-3 shrink-0">
                <Link
                  href={`/lost-reports/${report.id}/edit`}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors inline-flex items-center space-x-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Report</span>
                </Link>

                <button
                  onClick={handleCancelReport}
                  disabled={statusUpdating}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold rounded-xl transition-colors inline-flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {statusUpdating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  <span>Cancel Report</span>
                </button>
              </div>
            )}
          </div>

          {/* Privacy Security Banner */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-center space-x-3 text-xs text-blue-900">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <span>
              This lost item report is private. It is only accessible to you and authorized campus moderators for matching.
            </span>
          </div>

          {/* Core Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-5 border border-gray-100 text-xs sm:text-sm">
            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-500">Estimated Lost Location</p>
                <p className="font-bold text-gray-900">{report.lostLocation}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-500">Date Misplaced</p>
                <p className="font-bold text-gray-900">{formattedDate}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900">Item Description</h3>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/50 p-4 rounded-2xl border border-gray-100 whitespace-pre-line">
              {report.description}
            </p>
          </div>

          {/* Identifying Characteristics */}
          {report.identifyingCharacteristics && (
            <div className="space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-900">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                <h3>Secret Identifying Characteristics</h3>
              </div>
              <p className="text-sm text-indigo-950 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 whitespace-pre-line">
                {report.identifyingCharacteristics}
              </p>
            </div>
          )}

          {/* Images */}
          {report.images && report.images.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-900">Uploaded Reference Photos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {report.images.map((img, index) => (
                  <div
                    key={index}
                    className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-200"
                  >
                    <img
                      src={img}
                      alt={`Reference photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI-Powered Possible Matches Section */}
        <PossibleMatchesSection lostReportId={report.id} />
      </main>
    </div>
  );
}

import { fetchMatches, refreshMatches } from '@/lib/matchingApi';
import { PossibleMatchesResponse, LostReportMatchItem } from '@findora/types';
import { Sparkles, RefreshCw, CheckCircle, HelpCircle } from 'lucide-react';

function PossibleMatchesSection({ lostReportId }: { lostReportId: string }) {
  const [matchesData, setMatchesData] = useState<PossibleMatchesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMatches = async (forceRefresh = false) => {
    if (forceRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = forceRefresh
        ? await refreshMatches(lostReportId)
        : await fetchMatches(lostReportId);
      setMatchesData(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load potential matches');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, [lostReportId]);

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-indigo-600">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-xl font-bold text-gray-900">Possible Found Item Matches</h2>
          </div>
          <p className="text-xs text-gray-500">
            Automated recommendations based on public attributes, location, and dates.
          </p>
        </div>

        <button
          onClick={() => loadMatches(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Recomputing...' : 'Refresh Suggestions'}</span>
        </button>
      </div>

      {/* AI Disclaimer Banner */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-start space-x-3 text-xs text-amber-900">
        <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          <strong>AI Recommendation Disclaimer:</strong> Suggestions are recommendations based on public information only. A match is not proof of ownership. Ownership is verified separately through Findora&apos;s claim review process.
        </span>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center items-center text-xs text-gray-500 space-x-2">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span>Searching public inventory for matches...</span>
        </div>
      ) : error ? (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center text-xs text-gray-600 space-y-2">
          <p className="font-semibold text-gray-800">{error}</p>
          <button
            onClick={() => loadMatches(false)}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 font-semibold"
          >
            Retry Search
          </button>
        </div>
      ) : !matchesData || matchesData.matches.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200/60 rounded-2xl p-8 text-center space-y-2">
          <p className="text-sm font-bold text-gray-700">No Potential Matches Found Yet</p>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            We haven&apos;t found any approved items matching your lost report parameters yet. Click &quot;Refresh Suggestions&quot; if new items have been approved recently.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Found {matchesData.count} candidate item(s)</span>
            <span className="inline-flex items-center space-x-1 font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
              <span>Engine: {matchesData.source === 'AI' ? 'AI Model' : 'Rule-Based Engine'}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchesData.matches.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MatchCard({ match }: { match: LostReportMatchItem }) {
  const item = match.foundItem;

  const confidenceColors = {
    HIGH: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    MEDIUM: 'bg-amber-100 text-amber-800 border-amber-200',
    LOW: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <div className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow bg-white flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${confidenceColors[match.confidence] || confidenceColors.LOW}`}>
            {match.confidence} MATCH ({match.score}%)
          </span>
          <span className="text-[10px] font-semibold text-gray-400">
            {match.source === 'AI' ? 'AI Match' : 'Rule Match'}
          </span>
        </div>

        <div className="flex items-start space-x-3">
          {item.publicImages && item.publicImages.length > 0 ? (
            <img
              src={item.publicImages[0]}
              alt={item.title}
              className="w-16 h-16 rounded-xl object-cover border border-gray-100 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold shrink-0">
              No Image
            </div>
          )}

          <div className="space-y-1 flex-1 min-w-0">
            <h4 className="font-bold text-sm text-gray-900 truncate">{item.title}</h4>
            <div className="flex items-center space-x-2 text-xs text-gray-500 truncate">
              <span className="font-semibold">{item.category}</span>
              <span>•</span>
              <span className="truncate">{item.foundLocation}</span>
            </div>
          </div>
        </div>

        {match.reasons && match.reasons.length > 0 && (
          <div className="space-y-1 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <p className="text-[11px] font-bold text-gray-600">Match Signals:</p>
            <ul className="text-[11px] text-gray-600 space-y-0.5">
              {match.reasons.map((r, i) => (
                <li key={i} className="flex items-center space-x-1.5">
                  <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Link
        href={`/found-items/${item.id}`}
        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl text-center transition-colors inline-block"
      >
        Review Item & Submit Claim
      </Link>
    </div>
  );
}
