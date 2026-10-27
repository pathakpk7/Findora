"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthProvider';
import {
  Search,
  PlusCircle,
  FolderHeart,
  ShieldAlert,
  ShieldCheck,
  LogOut,
  Bell,
  AlertCircle,
  ChevronDown,
  User,
  QrCode,
  Award,
  Menu,
  X,
} from 'lucide-react';
import { NotificationBadge } from '@/components/notifications/NotificationBadge';
import { FindoraLogo } from '@/components/brand/FindoraLogo';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on path change
  useEffect(() => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isModerator = user?.role === 'MODERATOR' || user?.role === 'ADMIN';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo with Icon */}
        <Link href="/" className="flex items-center space-x-2 group">
          <FindoraLogo size="md" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link
            href="/found-items"
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              pathname === '/found-items'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Browse Items</span>
          </Link>

          <Link
            href="/lost-reports/new"
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              pathname === '/lost-reports/new'
                ? 'bg-rose-50 text-rose-700'
                : 'text-gray-600 hover:text-rose-700 hover:bg-rose-50/60'
            }`}
          >
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Report Missing</span>
          </Link>

          <Link
            href="/found-items/new"
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              pathname === '/found-items/new'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/60'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>Report Found</span>
          </Link>

          {/* Quick links for logged in user */}
          {user && (
            <>
              <Link
                href="/lost-reports"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                  pathname === '/lost-reports'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-indigo-500" />
                <span>My Reports</span>
              </Link>

              <Link
                href="/claims"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                  pathname?.startsWith('/claims')
                    ? 'bg-amber-50 text-amber-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>My Claims</span>
              </Link>

              {isModerator && (
                <Link
                  href="/moderation"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                    pathname?.startsWith('/moderation')
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-purple-700 bg-purple-50/80 hover:bg-purple-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Moderation</span>
                </Link>
              )}

              {isAdmin && (
                <Link
                  href="/admin"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                    pathname?.startsWith('/admin')
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                  <span>Admin</span>
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Right Action / Auth State */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {user ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Notification Bell with Badge */}
              <Link
                href="/notifications"
                className={`relative p-2 rounded-xl transition-colors ${
                  pathname?.startsWith('/notifications')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                }`}
                title="Campus Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5">
                  <NotificationBadge />
                </span>
              </Link>

              {/* Logged-In User Profile Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 pr-2.5 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-200/80 bg-white shadow-sm"
                  aria-expanded={isUserMenuOpen}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username || 'User avatar'}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {user.firstName?.[0] || user.username?.[0] || 'U'}
                    </div>
                  )}

                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-gray-900 leading-tight">
                      {user.username}
                    </span>
                    <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Animated Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.username}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                      {user.department && (
                        <span className="mt-1.5 inline-block text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                          {user.department} {user.rollNo ? `• ${user.rollNo}` : ''}
                        </span>
                      )}
                    </div>

                    {/* Nav Links inside dropdown */}
                    <div className="py-1 text-xs">
                      <Link
                        href="/lost-reports"
                        className="flex items-center space-x-2.5 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4 text-indigo-500" />
                        <span>My Lost Reports</span>
                      </Link>

                      <Link
                        href="/found-items/my"
                        className="flex items-center space-x-2.5 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        <FolderHeart className="w-4 h-4 text-emerald-500" />
                        <span>My Found Submissions</span>
                      </Link>

                      <Link
                        href="/claims"
                        className="flex items-center space-x-2.5 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-500" />
                        <span>My Claims &amp; Verifications</span>
                      </Link>

                      <Link
                        href="/handovers"
                        className="flex items-center space-x-2.5 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        <QrCode className="w-4 h-4 text-cyan-500" />
                        <span>QR Handovers</span>
                      </Link>

                      <Link
                        href="/leaderboard"
                        className="flex items-center space-x-2.5 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span>Campus Leaderboard &amp; Badges</span>
                      </Link>

                      {isModerator && (
                        <Link
                          href="/moderation"
                          className="flex items-center space-x-2.5 px-4 py-2 text-purple-700 bg-purple-50/50 hover:bg-purple-100 transition-colors font-semibold"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          <span>Moderation Portal</span>
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center space-x-2.5 px-4 py-2 text-blue-700 bg-blue-50/50 hover:bg-blue-100 transition-colors font-semibold"
                        >
                          <ShieldAlert className="w-4 h-4 text-blue-600" />
                          <span>Admin Console</span>
                        </Link>
                      )}
                    </div>

                    {/* Divider & Actions */}
                    <div className="pt-1 mt-1 border-t border-gray-100 text-xs">
                      <Link
                        href="/profile"
                        className="flex items-center space-x-2.5 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-gray-500" />
                        <span>Account Profile</span>
                      </Link>

                      <button
                        type="button"
                        onClick={logout}
                        className="w-full flex items-center space-x-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors font-semibold text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-blue-600 px-3.5 py-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            <Link
              href="/found-items"
              className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            >
              <Search className="w-4 h-4 text-blue-500" />
              <span>Browse Found Items</span>
            </Link>

            <Link
              href="/lost-reports/new"
              className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-700 hover:bg-rose-50"
            >
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Report Missing Item</span>
            </Link>

            <Link
              href="/found-items/new"
              className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Report Found Item</span>
            </Link>

            {user && (
              <>
                <div className="pt-2 pb-1 border-t border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3">
                  My Campus Activity
                </div>

                <Link
                  href="/lost-reports"
                  className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-blue-50"
                >
                  <ShieldAlert className="w-4 h-4 text-indigo-500" />
                  <span>My Lost Reports</span>
                </Link>

                <Link
                  href="/found-items/my"
                  className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-blue-50"
                >
                  <FolderHeart className="w-4 h-4 text-emerald-500" />
                  <span>Found Submissions</span>
                </Link>

                <Link
                  href="/claims"
                  className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-blue-50"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>My Claims</span>
                </Link>

                <Link
                  href="/handovers"
                  className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-blue-50"
                >
                  <QrCode className="w-4 h-4 text-cyan-500" />
                  <span>QR Handovers</span>
                </Link>

                <Link
                  href="/leaderboard"
                  className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-blue-50"
                >
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span>Leaderboard</span>
                </Link>

                {isModerator && (
                  <Link
                    href="/moderation"
                    className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-purple-700 bg-purple-50"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Moderation Portal</span>
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-900"
                  >
                    <ShieldAlert className="w-4 h-4 text-blue-400" />
                    <span>Admin Console</span>
                  </Link>
                )}

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between px-3">
                  <Link
                    href="/profile"
                    className="text-xs font-semibold text-gray-700 hover:text-blue-600"
                  >
                    Profile Settings
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center space-x-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
