"use client";
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from './api';

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('findora_token')) : null;
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const res = await fetch(API_URL + '/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message = body?.message || res.statusText || 'Failed to fetch user';
        localStorage.removeItem('token');
        localStorage.removeItem('findora_token');
        setUser(null);
        setError(message);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setUser(data);
    } catch (err: any) {
      setUser(null);
      setError(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('findora_token');
    setUser(null);
    router.push('/login');
  }

  return { user, loading, error, refresh: fetchUser, logout } as const;
}
