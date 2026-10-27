"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  ClipboardList,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Overview & Analytics',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: Users,
    },
    {
      name: 'Audit Logs',
      href: '/admin/audit-logs',
      icon: ShieldAlert,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-white shrink-0 p-5 space-y-8 flex flex-col justify-between shadow-xl">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center space-x-3 px-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-white">
              FINDORA
            </h2>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation Back to Site */}
      <div className="pt-4 border-t border-slate-800 space-y-2">
        <Link
          href="/moderation"
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-amber-300 hover:bg-slate-800/80 transition-colors"
        >
          <ClipboardList className="w-4 h-4 text-amber-400" />
          <span>Moderator Panel</span>
        </Link>
        <Link
          href="/found-items"
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Findora</span>
        </Link>
      </div>
    </aside>
  );
}
