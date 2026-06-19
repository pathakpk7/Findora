"use client";
import React, { createContext, useContext } from 'react';
import { useUser } from './useUser';
import { API_URL } from './api';

type LoginData = { email: string; password: string };
type RegisterData = { 
  email: string; 
  username: string; 
  password: string;
  rollNo?: string;
  department?: string;
  year?: number;
  section?: string;
};

type AuthContextType = {
  user: any;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, refresh, logout } = useUser();

  async function login(data: LoginData) {
    const res = await fetch(API_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw err;
    }

    const body = await res.json();
    localStorage.setItem('token', body.token);
    await refresh();
  }

  async function register(data: RegisterData) {
    const res = await fetch(API_URL + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw err;
    }

    return res.json();
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
