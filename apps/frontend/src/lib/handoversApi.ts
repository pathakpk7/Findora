import { Handover } from '@findora/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('findora_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface HandoverWithToken extends Handover {
  rawToken?: string;
}

export async function createHandover(claimId: string): Promise<HandoverWithToken> {
  const res = await fetch(`${API_URL}/api/handovers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ claimId }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to create handover session');
  }

  return body.data;
}

export async function getMyHandovers(): Promise<Handover[]> {
  const res = await fetch(`${API_URL}/api/handovers/my`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to fetch handovers');
  }

  return body.data;
}

export async function getHandover(id: string): Promise<Handover> {
  const res = await fetch(`${API_URL}/api/handovers/${id}`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to fetch handover details');
  }

  return body.data;
}

export async function scanHandover(token: string): Promise<Handover> {
  const res = await fetch(`${API_URL}/api/handovers/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ token: token.trim() }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to complete handover');
  }

  return body.data;
}

export async function cancelHandover(id: string): Promise<Handover> {
  const res = await fetch(`${API_URL}/api/handovers/${id}/cancel`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeader(),
    },
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || 'Failed to cancel handover');
  }

  return body.data;
}
