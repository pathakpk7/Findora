"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/useUser';
import { getAdminOverview, getAdminTrends } from '@/lib/adminApi';
import { AdminOverviewAnalytics, AdminTrendPoint, Role } from '@findora/types';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import {
  Users,
  Package,
  FileText,
  ShieldCheck,
  TrendingUp,
  Award,
  Loader2,
  AlertCircle,
  Calendar,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const [data, setData] = useState<AdminOverviewAnalytics | null>(null);
  const [trends, setTrends] = useState<AdminTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('30');

  useEffect(() => {
    if (!userLoading && (!user || user.role !== Role.ADMIN)) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const days = parseInt(dateRange);
      const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const toDate = new Date().toISOString();

      const [overviewRes, trendsRes] = await Promise.all([
        getAdminOverview({ from: fromDate, to: toDate }),
        getAdminTrends({ from: fromDate, to: toDate }),
      ]);

      setData(overviewRes);
      setTrends(trendsRes);
    } catch (err: any) {
      setError(err?.message || 'Failed to load admin analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === Role.ADMIN) {
      loadAnalytics();
    }
  }, [user, dateRange]);

  if (userLoading || (!user && loading)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user || user.role !== Role.ADMIN) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Platform Analytics & Overview
              </h1>
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                Live Data
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Operational metrics for Findora Lost & Found platform.
            </p>
          </div>

          {/* Date Filter Selector */}
          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl shrink-0">
            <Calendar className="w-4 h-4 text-slate-500 ml-2" />
            <button
              onClick={() => setDateRange('7')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dateRange === '7'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDateRange('30')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dateRange === '30'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setDateRange('90')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dateRange === '90'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              90 Days
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="font-semibold text-sm">{error}</p>
            <button
              onClick={loadAnalytics}
              className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : data ? (
          <>
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <AdminStatCard
                title="Total Users"
                value={data.users.total}
                subtitle={`${data.users.verified} Verified | ${data.users.active} Active`}
                icon={Users}
                color="blue"
                trend={`+${data.users.newInPeriod} in selected period`}
              />
              <AdminStatCard
                title="Found Items"
                value={data.foundItems.total}
                subtitle={`${data.foundItems.approved} Approved | ${data.foundItems.returned} Returned`}
                icon={Package}
                color="emerald"
                trend={`+${data.foundItems.newInPeriod} in selected period`}
              />
              <AdminStatCard
                title="Lost Reports"
                value={data.lostReports.total}
                subtitle={`${data.lostReports.active} Active | ${data.lostReports.recovered} Recovered`}
                icon={FileText}
                color="amber"
                trend={`+${data.lostReports.newInPeriod} in selected period`}
              />
              <AdminStatCard
                title="Claims"
                value={data.claims.total}
                subtitle={`${data.claims.approved} Approved | ${data.claims.completed} Completed`}
                icon={ShieldCheck}
                color="indigo"
                trend={`+${data.claims.newInPeriod} in selected period`}
              />
              <AdminStatCard
                title="Handovers"
                value={data.handovers.total}
                subtitle={`${data.handovers.completed} Completed | ${data.handovers.pending} Pending`}
                icon={CheckCircle2}
                color="purple"
                trend={`+${data.handovers.newInPeriod} in selected period`}
              />
              <AdminStatCard
                title="Avg Trust Score"
                value={data.reputation.avgTrustScore}
                subtitle={`Highest: ${data.reputation.maxTrustScore} pts`}
                icon={Award}
                color="slate"
                trend={`${data.reputation.badgesAwardedCount} Badges Awarded`}
              />
            </div>

            {/* Trends Section */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Daily Activity Trends ({trends.length} Data Points)</span>
              </h3>

              {trends.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">
                  No activity trends recorded for selected range.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-emerald-700">Found Items</th>
                        <th className="py-3 px-4 text-amber-700">Lost Reports</th>
                        <th className="py-3 px-4 text-indigo-700">Claims</th>
                        <th className="py-3 px-4 text-purple-700">Handovers</th>
                        <th className="py-3 px-4 text-blue-700">New Users</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {trends.slice(-14).map((t) => (
                        <tr key={t.date} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-800 font-sans">
                            {t.date}
                          </td>
                          <td className="py-3 px-4 text-emerald-600 font-bold">
                            {t.foundItems}
                          </td>
                          <td className="py-3 px-4 text-amber-600 font-bold">
                            {t.lostReports}
                          </td>
                          <td className="py-3 px-4 text-indigo-600 font-bold">
                            {t.claims}
                          </td>
                          <td className="py-3 px-4 text-purple-600 font-bold">
                            {t.handovers}
                          </td>
                          <td className="py-3 px-4 text-blue-600 font-bold">
                            {t.newUsers}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Breakdown Grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Item Status Breakdown */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Found Item Status Breakdown</span>
                </h3>
                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-600">Pending Review</span>
                    <span className="font-extrabold text-amber-600">{data.foundItems.pending}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-600">Approved Public</span>
                    <span className="font-extrabold text-emerald-600">{data.foundItems.approved}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-600">Returned to Owner</span>
                    <span className="font-extrabold text-blue-600">{data.foundItems.returned}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-600">Rejected Submissions</span>
                    <span className="font-extrabold text-red-600">{data.foundItems.rejected}</span>
                  </div>
                </div>
              </div>

              {/* Reputation Level Distribution */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Reputation Level Distribution</span>
                </h3>
                <div className="space-y-2 text-xs font-semibold">
                  {Object.entries(data.reputation.usersByLevel).map(([level, count]) => (
                    <div key={level} className="flex justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-700 font-bold">{level}</span>
                      <span className="font-extrabold text-indigo-600">{count} Users</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
