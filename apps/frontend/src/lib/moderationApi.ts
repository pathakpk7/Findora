import { Claim, ClaimStatus, PaginatedResponse, PublicFoundItem } from '@findora/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('findora_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface ModerationStats {
  pendingItemsCount: number;
  pendingClaimsCount: number;
  totalApprovedItemsCount: number;
  totalClaimedItemsCount: number;
}

export interface FoundItemModerationDetail extends PublicFoundItem {
  verification?: {
    id: string;
    serialNumber?: string;
    hiddenMarks?: string;
    internalContents?: string;
    purchaseReceiptUrl?: string;
    privateNotes?: string;
  };
  foundBy?: {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    rollNo?: string;
    department?: string;
  };
}

export interface ClaimModerationDetail extends Claim {
  foundItem?: FoundItemModerationDetail;
  claimant?: {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    rollNo?: string;
    department?: string;
  };
  reviewer?: {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export async function getModerationStats(): Promise<ModerationStats> {
  const res = await fetch(`${API_URL}/api/found-items/moderation/stats`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to fetch moderation metrics');
  }

  return body;
}

export async function getPendingFoundItems(params: {
  page?: number;
  limit?: number;
  category?: string;
} = {}): Promise<PaginatedResponse<PublicFoundItem>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.category) searchParams.set('category', params.category);

  const res = await fetch(`${API_URL}/api/found-items/moderation/pending?${searchParams.toString()}`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to fetch pending found items');
  }

  return body;
}

export async function getFoundItemModerationDetail(
  id: string,
): Promise<FoundItemModerationDetail> {
  const res = await fetch(`${API_URL}/api/found-items/moderation/${id}`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to fetch item moderation detail');
  }

  return body;
}

export async function approveFoundItem(id: string): Promise<PublicFoundItem> {
  const res = await fetch(`${API_URL}/api/found-items/${id}/approve`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeader(),
    },
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to approve item');
  }

  return body;
}

export async function rejectFoundItem(
  id: string,
  reason: string,
): Promise<PublicFoundItem> {
  const res = await fetch(`${API_URL}/api/found-items/${id}/reject`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ reason }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to reject item');
  }

  return body;
}

export async function getPendingClaims(params: {
  page?: number;
  limit?: number;
  status?: string;
} = {}): Promise<PaginatedResponse<Claim>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.status) searchParams.set('status', params.status);

  const res = await fetch(`${API_URL}/api/claims/moderation/pending?${searchParams.toString()}`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to fetch pending claims');
  }

  return body;
}

export async function getClaimModerationDetail(
  id: string,
): Promise<ClaimModerationDetail> {
  const res = await fetch(`${API_URL}/api/claims/moderation/${id}`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to fetch claim moderation detail');
  }

  return body.data || body;
}

export async function reviewClaim(
  id: string,
  data: { status: ClaimStatus; reviewReason?: string },
): Promise<Claim> {
  const res = await fetch(`${API_URL}/api/claims/${id}/review`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to submit claim review');
  }

  return body.data || body;
}
