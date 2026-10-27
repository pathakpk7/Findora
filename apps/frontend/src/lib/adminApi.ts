import {
  AdminOverviewAnalytics,
  AdminTrendPoint,
  AdminUserListItem,
  AuditLog,
  AuditAction,
  PaginatedResponse,
  Role,
} from '@findora/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('findora_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface AdminAnalyticsParams {
  from?: string;
  to?: string;
  period?: 'daily' | 'weekly';
}

export interface AdminUsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  isVerified?: boolean;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdminAuditLogsQueryParams {
  page?: number;
  limit?: number;
  action?: AuditAction;
  actorId?: string;
  from?: string;
  to?: string;
}

export async function getAdminOverview(
  params: AdminAnalyticsParams = {},
): Promise<AdminOverviewAnalytics> {
  const query = new URLSearchParams();
  if (params.from) query.append('from', params.from);
  if (params.to) query.append('to', params.to);

  const res = await fetch(`${API_URL}/api/admin/analytics/overview?${query.toString()}`, {
    headers: { ...getAuthHeader() },
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to fetch admin overview analytics');
  }

  return body.data;
}

export async function getAdminTrends(
  params: AdminAnalyticsParams = {},
): Promise<AdminTrendPoint[]> {
  const query = new URLSearchParams();
  if (params.from) query.append('from', params.from);
  if (params.to) query.append('to', params.to);

  const res = await fetch(`${API_URL}/api/admin/analytics/trends?${query.toString()}`, {
    headers: { ...getAuthHeader() },
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to fetch trend analytics');
  }

  return body.data || [];
}

export async function getAdminUsers(
  params: AdminUsersQueryParams = {},
): Promise<PaginatedResponse<AdminUserListItem>> {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());
  if (params.search) query.append('search', params.search);
  if (params.role) query.append('role', params.role);
  if (typeof params.isVerified === 'boolean')
    query.append('isVerified', params.isVerified.toString());
  if (typeof params.isActive === 'boolean')
    query.append('isActive', params.isActive.toString());
  if (params.sortBy) query.append('sortBy', params.sortBy);
  if (params.sortOrder) query.append('sortOrder', params.sortOrder);

  const res = await fetch(`${API_URL}/api/admin/users?${query.toString()}`, {
    headers: { ...getAuthHeader() },
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to fetch admin users list');
  }

  return {
    data: body.data || [],
    page: body.pagination?.page || 1,
    limit: body.pagination?.limit || 20,
    total: body.pagination?.total || 0,
    totalPages: body.pagination?.totalPages || 1,
  };
}

export async function updateUserRole(
  targetUserId: string,
  role: Role,
): Promise<any> {
  const res = await fetch(`${API_URL}/api/admin/users/${targetUserId}/role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ role }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to update user role');
  }

  return body.data;
}

export async function updateUserVerify(
  targetUserId: string,
  isVerified: boolean,
): Promise<any> {
  const res = await fetch(`${API_URL}/api/admin/users/${targetUserId}/verify`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ isVerified }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to update verification status');
  }

  return body.data;
}

export async function updateUserStatus(
  targetUserId: string,
  isActive: boolean,
  reason?: string,
): Promise<any> {
  const res = await fetch(`${API_URL}/api/admin/users/${targetUserId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ isActive, reason }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to update user account status');
  }

  return body.data;
}

export async function getAdminAuditLogs(
  params: AdminAuditLogsQueryParams = {},
): Promise<PaginatedResponse<AuditLog>> {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());
  if (params.action) query.append('action', params.action);
  if (params.actorId) query.append('actorId', params.actorId);
  if (params.from) query.append('from', params.from);
  if (params.to) query.append('to', params.to);

  const res = await fetch(`${API_URL}/api/admin/audit-logs?${query.toString()}`, {
    headers: { ...getAuthHeader() },
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to fetch admin audit logs');
  }

  return {
    data: body.data || [],
    page: body.pagination?.page || 1,
    limit: body.pagination?.limit || 20,
    total: body.pagination?.total || 0,
    totalPages: body.pagination?.totalPages || 1,
  };
}
