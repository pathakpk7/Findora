"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '@/lib/notificationsApi';
import { Notification, NotificationType } from '@findora/types';
import {
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  QrCode,
  PackageCheck,
  AlertCircle,
  Loader2,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export default function NotificationsCenterPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterUnread, setFilterUnread] = useState(false);

  const [markingAll, setMarkingAll] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [notifRes, countRes] = await Promise.all([
        getNotifications({
          page,
          limit: 15,
          read: filterUnread ? false : undefined,
        }),
        getUnreadCount(),
      ]);

      setNotifications(notifRes.data || []);
      setTotalPages(notifRes.totalPages || 1);
      setUnreadCount(countRes.unreadCount || 0);
    } catch (err: any) {
      setError(err?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, filterUnread]);

  const handleMarkOne = async (n: Notification) => {
    if (!n.readAt) {
      try {
        await markAsRead(n.id);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === n.id ? { ...item, readAt: new Date() } : item,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // Silent catch
      }
    }

    if (n.link) {
      router.push(n.link);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllAsRead();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, readAt: item.readAt || new Date() })),
      );
      setUnreadCount(0);
    } catch (err: any) {
      alert(err?.message || 'Failed to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.ITEM_APPROVED:
      case NotificationType.CLAIM_APPROVED:
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
      case NotificationType.ITEM_REJECTED:
      case NotificationType.CLAIM_REJECTED:
        return <XCircle className="w-5 h-5 text-red-600 shrink-0" />;
      case NotificationType.HANDOVER_CREATED:
      case NotificationType.HANDOVER_COMPLETED:
        return <QrCode className="w-5 h-5 text-purple-600 shrink-0" />;
      case NotificationType.ITEM_RETURNED:
        return <PackageCheck className="w-5 h-5 text-blue-600 shrink-0" />;
      case NotificationType.CLAIM_SUBMITTED:
      case NotificationType.ITEM_SUBMITTED:
        return <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500 shrink-0" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-semibold text-blue-200">
              <Bell className="w-3.5 h-3.5" />
              <span>Campus Activity Stream</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Notification Center
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'All caught up! No unread notifications.'}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md inline-flex items-center justify-center space-x-1.5 shrink-0 disabled:opacity-50"
            >
              {markingAll ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCheck className="w-4 h-4" />
              )}
              <span>Mark All as Read</span>
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setFilterUnread(false);
                setPage(1);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                !filterUnread
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Notifications
            </button>

            <button
              onClick={() => {
                setFilterUnread(true);
                setPage(1);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors inline-flex items-center space-x-1.5 ${
                filterUnread
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>Unread Only</span>
              {unreadCount > 0 && (
                <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <span className="text-xs text-gray-500 font-mono">
            Page {page} of {totalPages}
          </span>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="font-semibold text-sm">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-3">
            <Bell className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-900">
              No Notifications Found
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {filterUnread
                ? 'You have no unread notifications right now.'
                : 'Activity updates regarding your submissions, claims, and handovers will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const isUnread = !n.readAt;
              return (
                <div
                  key={n.id}
                  onClick={() => handleMarkOne(n)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start space-x-4 shadow-sm hover:shadow-md ${
                    isUnread
                      ? 'bg-blue-50/50 border-blue-200'
                      : 'bg-white border-gray-200 opacity-90'
                  }`}
                >
                  <div className="pt-0.5">{getNotificationIcon(n.type)}</div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-sm ${
                          isUnread
                            ? 'font-extrabold text-gray-950'
                            : 'font-semibold text-gray-800'
                        }`}
                      >
                        {n.title}
                      </h4>

                      <div className="flex items-center space-x-2 text-[11px] text-gray-400 shrink-0">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      {n.message}
                    </p>

                    {n.link && (
                      <div className="pt-1.5 inline-flex items-center space-x-1 text-[11px] font-bold text-blue-600 hover:text-blue-800">
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {isUnread && (
                    <span
                      className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 mt-1.5"
                      title="Unread"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 inline-flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 inline-flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
