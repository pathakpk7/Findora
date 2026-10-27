"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/useUser';
import {
  getAdminUsers,
  updateUserRole,
  updateUserStatus,
  updateUserVerify,
} from '@/lib/adminApi';
import { AdminUserListItem, Role } from '@findora/types';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Zap,
} from 'lucide-react';

export default function AdminUsersPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Action States
  const [actionUser, setActionUser] = useState<AdminUserListItem | null>(null);
  const [actionType, setActionType] = useState<'ROLE' | 'VERIFY' | 'STATUS' | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>(Role.USER);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!userLoading && (!user || user.role !== Role.ADMIN)) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  const loadUsersList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminUsers({
        page,
        limit: 20,
        search: search.trim() || undefined,
        role: (roleFilter as Role) || undefined,
        isVerified:
          verifiedFilter === 'true'
            ? true
            : verifiedFilter === 'false'
            ? false
            : undefined,
        isActive:
          statusFilter === 'true'
            ? true
            : statusFilter === 'false'
            ? false
            : undefined,
      });

      setUsers(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      setError(err?.message || 'Failed to load user management list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === Role.ADMIN) {
      loadUsersList();
    }
  }, [user, page, roleFilter, verifiedFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsersList();
  };

  const executeRoleChange = async () => {
    if (!actionUser) return;
    setSubmitting(true);
    try {
      await updateUserRole(actionUser.id, selectedRole);
      setActionUser(null);
      setActionType(null);
      await loadUsersList();
    } catch (err: any) {
      alert(err?.message || 'Failed to update role');
    } finally {
      setSubmitting(false);
    }
  };

  const executeVerifyToggle = async (u: AdminUserListItem) => {
    try {
      await updateUserVerify(u.id, !u.isVerified);
      await loadUsersList();
    } catch (err: any) {
      alert(err?.message || 'Failed to update verification');
    }
  };

  const executeStatusToggle = async () => {
    if (!actionUser) return;
    setSubmitting(true);
    try {
      await updateUserStatus(actionUser.id, !actionUser.isActive, deactivateReason);
      setActionUser(null);
      setActionType(null);
      setDeactivateReason('');
      await loadUsersList();
    } catch (err: any) {
      alert(err?.message || 'Failed to update user status');
    } finally {
      setSubmitting(false);
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
              <Users className="w-6 h-6 text-blue-600" />
              <span>User Management</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Admin visibility over campus accounts, roles, verification, and active status.
            </p>
          </div>

          <div className="text-xs font-bold text-slate-600 bg-slate-100 px-4 py-2 rounded-2xl">
            Total Accounts: {total}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search username, email, name, or roll number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-2xl hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center space-x-1 font-bold text-slate-500 mr-2">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
            >
              <option value="">All Roles</option>
              <option value="USER">USER</option>
              <option value="MODERATOR">MODERATOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            <select
              value={verifiedFilter}
              onChange={(e) => {
                setVerifiedFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
            >
              <option value="">All Verification</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
            >
              <option value="">All Account Status</option>
              <option value="true">Active</option>
              <option value="false">Deactivated</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="font-semibold text-sm">{error}</p>
            <button
              onClick={loadUsersList}
              className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              No User Accounts Found
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              No accounts match the specified search query or filters.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Verification</th>
                    <th className="py-3.5 px-4">Trust Score</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-4 px-4 space-y-0.5">
                        <div className="font-extrabold text-slate-900 flex items-center space-x-1.5">
                          <span>{u.username}</span>
                          {u.rollNo && (
                            <span className="text-[10px] font-mono text-slate-400">
                              ({u.rollNo})
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {u.email}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {u.department || 'No dept'} | Year {u.year || 'N/A'}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            u.role === Role.ADMIN
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : u.role === Role.MODERATOR
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        {u.isVerified ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-slate-400 font-medium">
                            <XCircle className="w-3 h-3 text-slate-400" />
                            <span>Unverified</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-slate-800">
                        <span className="inline-flex items-center space-x-1 text-amber-700">
                          <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{u.trustScore}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        {u.isActive ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-[10px] font-bold">
                            Deactivated
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right space-x-2">
                        {/* Change Role CTA */}
                        <button
                          onClick={() => {
                            setActionUser(u);
                            setSelectedRole(u.role);
                            setActionType('ROLE');
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition-colors"
                        >
                          Role
                        </button>

                        {/* Toggle Verify */}
                        <button
                          onClick={() => executeVerifyToggle(u)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-[11px] transition-colors"
                        >
                          {u.isVerified ? 'Unverify' : 'Verify'}
                        </button>

                        {/* Toggle Status */}
                        <button
                          onClick={() => {
                            setActionUser(u);
                            setActionType('STATUS');
                          }}
                          className={`px-2.5 py-1 font-bold rounded-lg text-[11px] transition-colors ${
                            u.isActive
                              ? 'bg-red-50 text-red-700 hover:bg-red-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            {totalPages > 1 && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
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

        {/* Role Change Modal */}
        {actionUser && actionType === 'ROLE' && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <h3 className="text-lg font-black text-slate-900">
                Update Role for @{actionUser.username}
              </h3>
              <p className="text-xs text-slate-500">
                Modifying user role alters platform access permissions. Changes are logged in audit records.
              </p>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Select New Role:
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as Role)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-extrabold text-slate-900"
                >
                  <option value="USER">USER (Student)</option>
                  <option value="MODERATOR">MODERATOR (Staff reviewer)</option>
                  <option value="ADMIN">ADMIN (Full platform admin)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => {
                    setActionUser(null);
                    setActionType(null);
                  }}
                  disabled={submitting}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={executeRoleChange}
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 inline-flex items-center space-x-1"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Role</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Deactivate/Reactivate Modal */}
        {actionUser && actionType === 'STATUS' && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <h3 className="text-lg font-black text-slate-900">
                {actionUser.isActive ? 'Deactivate' : 'Reactivate'} @{actionUser.username}
              </h3>
              <p className="text-xs text-slate-500">
                {actionUser.isActive
                  ? 'Deactivating an account prevents the user from logging in or submitting items.'
                  : 'Reactivating restores full user access.'}
              </p>

              {actionUser.isActive && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Reason for Deactivation (Optional Audit Note):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Violation of campus terms, spam report..."
                    value={deactivateReason}
                    onChange={(e) => setDeactivateReason(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => {
                    setActionUser(null);
                    setActionType(null);
                  }}
                  disabled={submitting}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={executeStatusToggle}
                  disabled={submitting}
                  className={`px-4 py-2 text-white text-xs font-bold rounded-xl inline-flex items-center space-x-1 ${
                    actionUser.isActive
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {actionUser.isActive ? 'Confirm Deactivate' : 'Confirm Reactivate'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
