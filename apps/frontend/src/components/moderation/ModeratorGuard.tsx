"use client";

import { ReactNode } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/useUser';
import { ShieldAlert, Loader2, Lock } from 'lucide-react';

interface ModeratorGuardProps {
  children: ReactNode;
}

export function ModeratorGuard({ children }: ModeratorGuardProps) {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="text-sm font-semibold text-gray-600">Verifying staff permissions...</p>
      </div>
    );
  }

  if (!user || (user.role !== 'MODERATOR' && user.role !== 'ADMIN')) {
    return (
      <div className="flex-1 max-w-xl w-full mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-md">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-gray-900">Access Restricted</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            The Moderation Dashboard is an internal operational interface reserved exclusively for authorized campus moderators and administrators.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs space-y-1 text-left">
          <div className="flex items-center space-x-1.5 font-bold text-amber-950">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Strict Role Enforcement</span>
          </div>
          <p className="text-gray-700">
            Your current account role (<strong>{user?.role || 'UNAUTHENTICATED'}</strong>) does not have staff privileges. If you are a campus moderator, please log in with your staff account credentials.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 text-white font-semibold text-sm rounded-xl hover:bg-purple-700 transition-colors shadow-sm"
          >
            Sign In with Staff Account
          </Link>
          <Link
            href="/found-items"
            className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors"
          >
            Return to Public Inventory
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
