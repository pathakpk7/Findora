"use client";

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { getMyReputation } from '@/lib/reputationApi';
import { UserReputationResponse } from '@findora/types';
import { TrustScoreCard } from '@/components/reputation/TrustScoreCard';
import { BadgeGrid } from '@/components/reputation/BadgeGrid';
import { ReputationHistoryList } from '@/components/reputation/ReputationHistoryList';
import { Loader2, AlertCircle } from 'lucide-react';

export default function ProfileReputationPage() {
  const [data, setData] = useState<UserReputationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReputation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyReputation();
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load reputation details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReputation();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="font-semibold text-sm">{error}</p>
            <button
              onClick={loadReputation}
              className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : data ? (
          <>
            {/* Trust Score Header Banner */}
            <TrustScoreCard
              trustScore={data.trustScore}
              level={data.level}
              levelName={data.levelName}
              nextLevelScore={data.nextLevelScore}
              progressPercent={data.progressPercent}
            />

            {/* Badges Collection */}
            <BadgeGrid userBadges={data.badges} />

            {/* Reputation History Timeline */}
            <ReputationHistoryList history={data.history} />
          </>
        ) : null}
      </main>
    </div>
  );
}
