"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthProvider';
import {
  Search,
  Plus,
  Shield,
  LogOut,
  Bell,
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

  useEffect(() => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
    <header className="sticky top-0 z-50 bg-[#faf9f6]/90 backdrop-blur-md border-b border-stone-200/70 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-85">
          <FindoraLogo size="md" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-7 text-sm font-medium text-stone-600">
          <Link
            href="/found-items"
            className={`transition-colors hover:text-stone-950 ${
              pathname === '/found-items' ? 'text-stone-950 font-semibold' : ''
            }`}
          >
            Directory
          </Link>

          <Link
            href="/lost-reports/new"
            className={`transition-colors hover:text-stone-950 ${
              pathname === '/lost-reports/new' ? 'text-stone-950 font-semibold' : ''
            }`}
          >
            File Lost Notice
          </Link>

          <Link
            href="/found-items/new"
            className={`transition-colors hover:text-stone-950 ${
              pathname === '/found-items/new' ? 'text-stone-950 font-semibold' : ''
            }`}
          >
            Report Found
          </Link>

          {user && (
            <>
              <Link
                href="/lost-reports"
                className={`transition-colors hover:text-stone-950 ${
                  pathname === '/lost-reports' ? 'text-stone-950 font-semibold' : ''
                }`}
              >
                My Notices
              </Link>

              <Link
                href="/claims"
                className={`transition-colors hover:text-stone-950 ${
                  pathname?.startsWith('/claims') ? 'text-stone-950 font-semibold' : ''
                }`}
              >
                Claims
              </Link>

              {isModerator && (
                <Link
                  href="/moderation"
                  className={`transition-colors hover:text-stone-950 ${
                    pathname?.startsWith('/moderation') ? 'text-stone-950 font-semibold' : ''
                  }`}
                >
                  Moderation
                </Link>
              )}

              {isAdmin && (
                <Link
                  href="/admin"
                  className={`transition-colors hover:text-stone-950 ${
                    pathname?.startsWith('/admin') ? 'text-stone-950 font-semibold' : ''
                  }`}
                >
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Action Controls / Auth State */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <Link
                href="/notifications"
                className={`relative p-2 text-stone-600 hover:text-stone-950 transition-colors ${
                  pathname?.startsWith('/notifications') ? 'text-stone-950' : ''
                }`}
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1">
                  <NotificationBadge />
                </span>
              </Link>

              {/* User Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2.5 py-1 px-2 rounded-md hover:bg-stone-200/50 transition-colors text-left"
                  aria-expanded={isUserMenuOpen}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username || 'User avatar'}
                      className="w-7 h-7 rounded-full object-cover grayscale contrast-125"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center font-medium text-xs">
                      {user.firstName?.[0] || user.username?.[0] || 'U'}
                    </div>
                  )}

                  <span className="hidden sm:inline-block text-xs font-medium text-stone-900">
                    {user.username}
                  </span>

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-stone-200/80 py-2 z-50 animate-reveal-fade">
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <p className="text-xs font-semibold text-stone-900 truncate">
                        {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.username}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">{user.email}</p>
                      {user.department && (
                        <p className="text-[10px] text-stone-400 mt-1">
                          {user.department} {user.rollNo ? `· ${user.rollNo}` : ''}
                        </p>
                      )}
                    </div>

                    <div className="py-1 text-xs text-stone-700">
                      <Link
                        href="/lost-reports"
                        className="flex items-center space-x-2.5 px-4 py-2 hover:bg-stone-50 hover:text-stone-950 transition-colors"
                      >
                        <Search className="w-3.5 h-3.5 text-stone-400" />
                        <span>My Lost Notices</span>
                      </Link>

                      <Link
                        href="/found-items/my"
                        className="flex items-center space-x-2.5 px-4 py-2 hover:bg-stone-50 hover:text-stone-950 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-stone-400" />
                        <span>My Found Submissions</span>
                      </Link>

                      <Link
                        href="/claims"
                        className="flex items-center space-x-2.5 px-4 py-2 hover:bg-stone-50 hover:text-stone-950 transition-colors"
                      >
                        <Shield className="w-3.5 h-3.5 text-stone-400" />
                        <span>Active Claims</span>
                      </Link>

                      <Link
                        href="/handovers"
                        className="flex items-center space-x-2.5 px-4 py-2 hover:bg-stone-50 hover:text-stone-950 transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5 text-stone-400" />
                        <span>Handover Verification</span>
                      </Link>

                      <Link
                        href="/leaderboard"
                        className="flex items-center space-x-2.5 px-4 py-2 hover:bg-stone-50 hover:text-stone-950 transition-colors"
                      >
                        <Award className="w-3.5 h-3.5 text-stone-400" />
                        <span>Campus Leaderboard</span>
                      </Link>

                      {isModerator && (
                        <Link
                          href="/moderation"
                          className="flex items-center space-x-2.5 px-4 py-2 text-stone-900 bg-stone-50 hover:bg-stone-100 transition-colors font-medium"
                        >
                          <Shield className="w-3.5 h-3.5 text-blue-600" />
                          <span>Staff Moderation</span>
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center space-x-2.5 px-4 py-2 text-stone-900 bg-stone-50 hover:bg-stone-100 transition-colors font-medium"
                        >
                          <Shield className="w-3.5 h-3.5 text-stone-950" />
                          <span>Admin Console</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 mt-1 border-t border-stone-100 text-xs">
                      <Link
                        href="/profile"
                        className="flex items-center space-x-2.5 px-4 py-2 text-stone-700 hover:bg-stone-50 transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        <span>Profile Settings</span>
                      </Link>

                      <button
                        type="button"
                        onClick={logout}
                        className="w-full flex items-center space-x-2.5 px-4 py-2 text-stone-600 hover:text-red-600 hover:bg-red-50/50 transition-colors text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-950 transition-colors px-2 py-1"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-xs sm:text-sm font-medium bg-stone-950 hover:bg-stone-800 text-white px-3.5 py-1.5 rounded-md transition-all active:scale-[0.98]"
              >
                Create Account
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-stone-600 hover:text-stone-950 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-[#faf9f6] px-4 pt-4 pb-6 space-y-3 animate-reveal-fade">
          <div className="space-y-1 text-sm font-medium text-stone-700">
            <Link
              href="/found-items"
              className="block px-3 py-2 rounded-md hover:bg-stone-200/50 transition-colors"
            >
              Directory
            </Link>

            <Link
              href="/lost-reports/new"
              className="block px-3 py-2 rounded-md hover:bg-stone-200/50 transition-colors"
            >
              File Lost Notice
            </Link>

            <Link
              href="/found-items/new"
              className="block px-3 py-2 rounded-md hover:bg-stone-200/50 transition-colors"
            >
              Report Found Item
            </Link>

            {user && (
              <>
                <div className="pt-3 pb-1 border-t border-stone-200/70 text-[11px] font-semibold text-stone-400 px-3">
                  Account Activity
                </div>

                <Link
                  href="/lost-reports"
                  className="block px-3 py-2 rounded-md hover:bg-stone-200/50 transition-colors"
                >
                  My Lost Notices
                </Link>

                <Link
                  href="/found-items/my"
                  className="block px-3 py-2 rounded-md hover:bg-stone-200/50 transition-colors"
                >
                  Found Submissions
                </Link>

                <Link
                  href="/claims"
                  className="block px-3 py-2 rounded-md hover:bg-stone-200/50 transition-colors"
                >
                  Claims
                </Link>

                <Link
                  href="/handovers"
                  className="block px-3 py-2 rounded-md hover:bg-stone-200/50 transition-colors"
                >
                  Handover Verification
                </Link>

                <Link
                  href="/leaderboard"
                  className="block px-3 py-2 rounded-md hover:bg-stone-200/50 transition-colors"
                >
                  Leaderboard
                </Link>

                {isModerator && (
                  <Link
                    href="/moderation"
                    className="block px-3 py-2 rounded-md bg-stone-200/60 font-semibold"
                  >
                    Staff Moderation
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="block px-3 py-2 rounded-md bg-stone-900 text-white font-semibold"
                  >
                    Admin Console
                  </Link>
                )}

                <div className="pt-3 border-t border-stone-200/70 flex items-center justify-between px-3">
                  <Link
                    href="/profile"
                    className="text-xs text-stone-600 hover:text-stone-950"
                  >
                    Profile Settings
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Sign Out
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
