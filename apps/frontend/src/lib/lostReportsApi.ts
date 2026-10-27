import { LostReport, LostReportStatus, ItemCategory, PaginatedResponse } from '@findora/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('findora_token') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface CreateLostReportData {
  title: string;
  category: ItemCategory;
  description: string;
  lostLocation: string;
  lostDate: string;
  identifyingCharacteristics?: string;
  images?: string[];
}

export interface UpdateLostReportData {
  title?: string;
  category?: ItemCategory;
  description?: string;
  lostLocation?: string;
  lostDate?: string;
  identifyingCharacteristics?: string;
  images?: string[];
}

export interface QueryLostReportsParams {
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'lostDate';
  sortOrder?: 'asc' | 'desc';
}

export async function createLostReport(data: CreateLostReportData): Promise<LostReport> {
  const res = await fetch(`${API_URL}/api/lost-reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to create lost report');
  }

  return body.data;
}

export async function getMyLostReports(
  params: QueryLostReportsParams = {},
): Promise<PaginatedResponse<LostReport>> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== '') {
      searchParams.append(key, String(val));
    }
  });

  const res = await fetch(`${API_URL}/api/lost-reports/my?${searchParams.toString()}`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to fetch lost reports');
  }

  return body;
}

export async function getLostReport(id: string): Promise<LostReport> {
  const res = await fetch(`${API_URL}/api/lost-reports/${id}`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to fetch lost report details');
  }

  return body.data;
}

export async function updateLostReport(
  id: string,
  data: UpdateLostReportData,
): Promise<LostReport> {
  const res = await fetch(`${API_URL}/api/lost-reports/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to update lost report');
  }

  return body.data;
}

export async function changeLostReportStatus(
  id: string,
  status: LostReportStatus,
): Promise<LostReport> {
  const res = await fetch(`${API_URL}/api/lost-reports/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ status }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to update report status');
  }

  return body.data;
}
