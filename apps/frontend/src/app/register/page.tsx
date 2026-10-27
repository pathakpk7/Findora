"use client";

import { Suspense } from 'react';
import { AuthSideBySide } from '@/components/auth/AuthSideBySide';

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AuthSideBySide initialMode="register" />
    </Suspense>
  );
}
