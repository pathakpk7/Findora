"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/useUser';
import { getAdminAuditLogs } from '@/lib/adminApi';
import { AuditLog, AuditAction, Role } from '@findora/types';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import {
  ShieldAlert,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Clock,
} from 'lucide-react';

export default function AdminAuditLogsPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && (!user || user.role !== Role.ADMIN)) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminAuditLogs({
        page,
        limit: 20,
        action: (actionFilter as AuditAction) || undefined,
      });

      setLogs(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      setError(err?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === Role.ADMIN) {
      loadLogs();
    }
  }, [user, page, actionFilter]);

  const getActionBadgeColor = (action: AuditAction) => {
    switch (action) {
      case AuditAction.ROLE_CHANGED:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case AuditAction.USER_DEACTIVATED:
        return 'bg-red-100 text-red-800 border-red-200';
      case AuditAction.USER_REACTIVATED:
      case AuditAction.USER_VERIFIED:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case AuditAction.ITEM_APPROVED:
      case AuditAction.CLAIM_APPROVED:
      case AuditAction.HANDOVER_COMPLETED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case AuditAction.TRUST_SCORE_CHANGED:
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

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

      <main className="flex-1 p-6 md:p-10 space-y-6 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <ShieldAlert className="w-6 h-6 text-purple-600" />
              <span>Audit Log Inspector</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Immutable operational audit records of privileged administrative and moderation actions.
            </p>
          </div>

          <div className="text-xs font-bold text-slate-600 bg-slate-100 px-4 py-2 rounded-2xl">
            Total Log Entries: {total}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600 font-bold">Action Type:</span>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold"
            >
              <option value="">All Audit Actions</option>
              <option value="ROLE_CHANGED">ROLE_CHANGED</option>
              <option value="USER_DEACTIVATED">USER_DEACTIVATED</option>
              <option value="USER_REACTIVATED">USER_REACTIVATED</option>
              <option value="USER_VERIFIED">USER_VERIFIED</option>
              <option value="ITEM_APPROVED">ITEM_APPROVED</option>
              <option value="ITEM_REJECTED">ITEM_REJECTED</option>
              <option value="CLAIM_APPROVED">CLAIM_APPROVED</option>
              <option value="CLAIM_REJECTED">CLAIM_REJECTED</option>
              <option value="HANDOVER_COMPLETED">HANDOVER_COMPLETED</option>
              <option value="TRUST_SCORE_CHANGED">TRUST_SCORE_CHANGED</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="font-semibold text-sm">{error}</p>
            <button
              onClick={loadLogs}
              className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              No Audit Log Entries Found
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              No audit records match the specified action filter.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Actor</th>
                    <th className="py-3.5 px-4">Target Entity</th>
                    <th className="py-3.5 px-4">Audit Metadata</th>
                    <th className="py-3.5 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-4 px-4 font-sans">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${getActionBadgeColor(
                            log.action,
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-sans font-bold text-slate-800">
                        {log.actor ? `@${log.actor.username}` : 'System'}
                      </td>

                      <td className="py-4 px-4 font-sans">
                        <span className="font-extrabold text-slate-700">
                          {log.entityType}
                        </span>{' '}
                        <span className="text-[10px] text-slate-400 font-mono">
                          #{log.entityId.slice(-6)}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-slate-600 max-w-xs truncate text-[11px] font-mono">
                        {log.metadata || '—'}
                      </td>

                      <td className="py-4 px-4 text-right text-slate-400 font-sans text-[11px]">
                        <div className="flex items-center justify-end space-x-1">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            {totalPages > 1 && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between font-sans">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 inline-flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="text-xs text-slate-500 font-semibold">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 inline-flex items-center space-x-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
