import { API_URL } from './api';
import { ItemCategory, PublicFoundItem, PaginatedResponse } from '@findora/types';

export interface FoundItemQueryParams {
  search?: string;
  category?: ItemCategory | string;
  foundLocation?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'foundDate';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateFoundItemPayload {
  title: string;
  category: ItemCategory;
  publicDescription: string;
  foundLocation: string;
  foundDate: string;
  publicImages?: string[];
  serialNumber?: string;
  hiddenMarks?: string;
  privateIdentifyingInfo?: string;
  privateNotes?: string;
}

export interface UpdateFoundItemPayload {
  title?: string;
  category?: ItemCategory;
  publicDescription?: string;
  foundLocation?: string;
  foundDate?: string;
  publicImages?: string[];
  serialNumber?: string;
  hiddenMarks?: string;
  privateIdentifyingInfo?: string;
  privateNotes?: string;
}

function getAuthHeader(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Fetch public approved found items
 */
export async function getPublicFoundItems(
  params: FoundItemQueryParams = {},
): Promise<PaginatedResponse<PublicFoundItem>> {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.category) query.append('category', params.category);
  if (params.foundLocation) query.append('foundLocation', params.foundLocation);
  if (params.dateFrom) query.append('dateFrom', params.dateFrom);
  if (params.dateTo) query.append('dateTo', params.dateTo);
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());
  if (params.sortBy) query.append('sortBy', params.sortBy);
  if (params.sortOrder) query.append('sortOrder', params.sortOrder);

  const res = await fetch(`${API_URL}/found-items?${query.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to fetch found items');
  }
  return res.json();
}

/**
 * Fetch single approved found item by ID
 */
export async function getPublicFoundItemById(id: string): Promise<PublicFoundItem> {
  const res = await fetch(`${API_URL}/found-items/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Found item not found or unavailable');
  }
  return res.json();
}

/**
 * Fetch user's own submitted items
 */
export async function getMyFoundItems(
  params: FoundItemQueryParams = {},
): Promise<PaginatedResponse<PublicFoundItem>> {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());

  const res = await fetch(`${API_URL}/found-items/my?${query.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to fetch your submitted items');
  }
  return res.json();
}

/**
 * Submit a new found item report
 */
export async function createFoundItem(
  payload: CreateFoundItemPayload,
): Promise<PublicFoundItem> {
  const res = await fetch(`${API_URL}/found-items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(
      errorData?.message
        ? Array.isArray(errorData.message)
          ? errorData.message.join(', ')
          : errorData.message
        : 'Failed to submit found item',
    );
  }
  return res.json();
}

/**
 * Update an existing submitted item
 */
export async function updateFoundItem(
  id: string,
  payload: UpdateFoundItemPayload,
): Promise<PublicFoundItem> {
  const res = await fetch(`${API_URL}/found-items/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(
      errorData?.message
        ? Array.isArray(errorData.message)
          ? errorData.message.join(', ')
          : errorData.message
        : 'Failed to update found item',
    );
  }
  return res.json();
}
