import { PossibleMatchesResponse } from '@findora/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_BASE_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

function getAuthHeader(): Record<string, string> {
  const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('findora_token')) : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Fetch candidate matches for a Lost Report
 */
export async function fetchMatches(
  lostReportId: string,
  limit = 10,
  minScore = 0
): Promise<PossibleMatchesResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    minScore: minScore.toString(),
  });

  const res = await fetch(
    `${API_BASE_URL}/lost-reports/${lostReportId}/matches?${params.toString()}`,
    {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch matches');
  }

  return res.json();
}

/**
 * Force recompute candidate matches for a Lost Report
 */
export async function refreshMatches(
  lostReportId: string,
  limit = 10,
  minScore = 0
): Promise<PossibleMatchesResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    minScore: minScore.toString(),
  });

  const res = await fetch(
    `${API_BASE_URL}/lost-reports/${lostReportId}/matches/refresh?${params.toString()}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to refresh matches');
  }

  return res.json();
}
