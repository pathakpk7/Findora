import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Search, PlusCircle, ShieldCheck, Sparkles, FolderHeart, AlertCircle } from 'lucide-react';
import { CampusItemsDirectory } from '@/components/home/CampusItemsDirectory';
import { FindoraLogo } from '@/components/brand/FindoraLogo';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold text-blue-200 border border-white/15">
              <Sparkles className="w-4 h-4 text-blue-300" />
              <span>Smart Campus Lost & Found Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
              Lost something on campus? <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Findora helps you recover it safely.
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-blue-100/80 leading-relaxed">
              Connect with fellow students to locate lost items. Privacy-first ownership verification ensures items return only to their rightful owners.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/found-items"
                className="inline-flex items-center space-x-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm sm:text-base rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <Search className="w-5 h-5" />
                <span>Browse Found Items</span>
              </Link>

              <Link
                href="/lost-reports/new"
                className="inline-flex items-center space-x-2 px-6 py-3.5 bg-rose-600/90 hover:bg-rose-600 text-white font-semibold text-sm sm:text-base rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <AlertCircle className="w-5 h-5 text-rose-200" />
                <span>Report Missing Item</span>
              </Link>

              <Link
                href="/found-items/new"
                className="inline-flex items-center space-x-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base rounded-2xl border border-white/20 backdrop-blur-md transition-all"
              >
                <PlusCircle className="w-5 h-5 text-blue-300" />
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

      {/* Brand Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <FindoraLogo variant="dark" size="md" withTagline={true} />
            <p className="text-xs text-slate-400 mt-2">
              Empowering university campuses with transparent lost and found item recovery.
            </p>
          </div>
          <div className="flex items-center space-x-6 text-xs text-slate-400">
            <Link href="/found-items" className="hover:text-cyan-400 transition-colors">
              Browse Items
            </Link>
            <Link href="/lost-reports/new" className="hover:text-cyan-400 transition-colors">
              Report Missing
            </Link>
            <Link href="/found-items/new" className="hover:text-cyan-400 transition-colors">
              Report Found
            </Link>
            <Link href="/login" className="hover:text-cyan-400 transition-colors">
              Account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

