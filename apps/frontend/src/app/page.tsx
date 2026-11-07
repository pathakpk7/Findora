import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Search, PlusCircle, ShieldCheck, Sparkles, FolderHeart, AlertCircle } from 'lucide-react';
import { CampusItemsDirectory } from '@/components/home/CampusItemsDirectory';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 text-white py-16 sm:py-20 px-3 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-200 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>Smart Campus Lost & Found Platform</span>
            </div>

            <h1 className="text-3xl sm:text-6xl font-black tracking-tight leading-tight">
              Lost something on campus? <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Findora helps you recover it safely.
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-lg text-blue-100/80 leading-relaxed px-2">
              Connect with fellow students to locate lost items. Privacy-first ownership verification ensures items return only to their rightful owners.
            </p>

            {/* Action Buttons: Strictly in ONE LINE on Mobile */}
            <div className="pt-4 w-full flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar gap-2 sm:gap-4 py-2 px-1 scroll-smooth">
              <Link
                href="/found-items"
                className="shrink-0 inline-flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-base rounded-xl sm:rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap active:scale-95"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span>Browse Found Items</span>
              </Link>

              <Link
                href="/lost-reports/new"
                className="shrink-0 inline-flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3.5 bg-rose-600/90 hover:bg-rose-600 text-white font-semibold text-xs sm:text-base rounded-xl sm:rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap active:scale-95"
              >
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-200 shrink-0" />
                <span>Report Missing Item</span>
              </Link>

              <Link
                href="/found-items/new"
                className="shrink-0 inline-flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-base rounded-xl sm:rounded-2xl border border-white/20 backdrop-blur-md transition-all whitespace-nowrap active:scale-95"
              >
                <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300 shrink-0" />
                <span>Report a Found Item</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Live Campus Items Directory (Items shown first without requiring sign-in) */}
        <CampusItemsDirectory />

        {/* Core Value Pillars */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-3">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Campus Inventory</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Filter approved items by category, campus location, and date to quickly locate what belongs to you.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Privacy & Verification</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Sensitive serial numbers and hidden characteristics remain private for moderator verification only.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-3">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
                <FolderHeart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Student Community</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Report found items in seconds, track moderation status, and help keep campus honest and connected.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Brand Footer: Designed for crystal-clear Findora visibility on Mobile & Desktop */}
      <footer className="bg-slate-900 text-slate-300 py-10 sm:py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start space-y-2 text-center md:text-left w-full md:w-auto">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Find<span className="text-cyan-400">ora</span>
                </span>
                <span className="text-[10px] bg-blue-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded-full border border-blue-400/30 uppercase tracking-wider">
                  Campus
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Empowering university campuses with transparent lost and found item recovery.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-5 sm:gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-400 font-medium">
            <Link href="/found-items" className="hover:text-cyan-400 transition-colors py-1">
              Browse Found Items
            </Link>
            <Link href="/lost-reports/new" className="hover:text-cyan-400 transition-colors py-1">
              Report Missing Item
            </Link>
            <Link href="/found-items/new" className="hover:text-cyan-400 transition-colors py-1">
              Report a Found Item
            </Link>
            <Link href="/login" className="hover:text-cyan-400 transition-colors py-1">
              Account
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-slate-800/60 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Findora Campus Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
