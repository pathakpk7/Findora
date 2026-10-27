import { Notification, NotificationType, PaginatedResponse } from '@findora/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('findora_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  read?: boolean;
  type?: NotificationType;
}

export async function getNotifications(
  params: GetNotificationsParams = {},
): Promise<PaginatedResponse<Notification>> {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());
  if (typeof params.read === 'boolean') query.append('read', params.read.toString());
  if (params.type) query.append('type', params.type);

  const res = await fetch(`${API_URL}/api/notifications?${query.toString()}`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to fetch notifications');
  }

  return {
    data: body.data || [],
    page: body.pagination?.page || 1,
    limit: body.pagination?.limit || 20,
    total: body.pagination?.total || 0,
    totalPages: body.pagination?.totalPages || 1,
  };
}

export async function getUnreadCount(): Promise<{ unreadCount: number }> {
  const res = await fetch(`${API_URL}/api/notifications/unread-count`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to fetch unread notification count');
  }

  return body.data;
}

export async function markAsRead(id: string): Promise<Notification> {
  const res = await fetch(`${API_URL}/api/notifications/${id}/read`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeader(),
    },
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to mark notification as read');
  }

  return body.data;
}

export async function markAllAsRead(): Promise<{ count: number }> {
  const res = await fetch(`${API_URL}/api/notifications/read-all`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeader(),
    },
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to mark all notifications as read');
  }

  return body.data;
}
