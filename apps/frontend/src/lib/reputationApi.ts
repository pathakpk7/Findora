import { LeaderboardEntry, PaginatedResponse, UserReputationResponse } from '@findora/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('findora_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getMyReputation(): Promise<UserReputationResponse> {
  const res = await fetch(`${API_URL}/api/reputation/me`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to fetch reputation data');
  }

  return body.data;
}

export async function getLeaderboard(
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<LeaderboardEntry>> {
  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const res = await fetch(`${API_URL}/api/reputation/leaderboard?${query.toString()}`);
  const body = await res.json();

  if (!res.ok) {
    throw new Error(body.message || 'Failed to fetch leaderboard');
  }

  return {
    data: body.data || [],
    page: body.pagination?.page || 1,
    limit: body.pagination?.limit || 20,
    total: body.pagination?.total || 0,
    totalPages: body.pagination?.totalPages || 1,
  };
}
