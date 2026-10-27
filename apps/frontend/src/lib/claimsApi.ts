import { Claim, ClaimStatus, PaginatedResponse } from '@findora/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('findora_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface CreateClaimData {
  foundItemId: string;
  evidence: string;
}

export interface UpdateClaimData {
  evidence: string;
}

export interface ReviewClaimData {
  status: ClaimStatus;
  reviewReason?: string;
}

export interface QueryClaimsParams {
  status?: string;
  foundItemId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export async function createClaim(data: CreateClaimData): Promise<Claim> {
  const res = await fetch(`${API_URL}/api/claims`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to submit claim');
  }

  return body.data;
}

export async function getMyClaims(
  params: QueryClaimsParams = {},
): Promise<PaginatedResponse<Claim>> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== '') {
      searchParams.append(key, String(val));
    }
  });

  const res = await fetch(`${API_URL}/api/claims/my?${searchParams.toString()}`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to fetch claims');
  }

  return body;
}

export async function getClaim(id: string): Promise<Claim> {
  const res = await fetch(`${API_URL}/api/claims/${id}`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to fetch claim details');
  }

  return body.data;
}

export async function cancelClaim(id: string): Promise<Claim> {
  const res = await fetch(`${API_URL}/api/claims/${id}/cancel`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeader(),
    },
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to cancel claim');
  }

  return body.data;
}

export async function updateClaimEvidence(
  id: string,
  data: UpdateClaimData,
): Promise<Claim> {
  const res = await fetch(`${API_URL}/api/claims/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to update claim evidence');
  }

  return body.data;
}
