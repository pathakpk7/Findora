"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PublicFoundItem, ItemCategory } from '@findora/types';
import { getPublicFoundItems } from '@/lib/foundItemsApi';
import { 
  Search, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Image as ImageIcon,
  Lock
} from 'lucide-react';

const CATEGORY_TABS: { label: string; value: string }[] = [
  { label: 'All Items', value: '' },
  { label: 'Electronics', value: ItemCategory.ELECTRONICS },
  { label: 'Earbuds & Audio', value: ItemCategory.EARBUDS },
  { label: 'Wallets & Money', value: ItemCategory.WALLET },
  { label: 'ID Cards', value: ItemCategory.ID_CARD },
  { label: 'Keys', value: ItemCategory.KEYS },
  { label: 'Books', value: ItemCategory.BOOK },
];

export function CampusItemsDirectory() {
  const [items, setItems] = useState<PublicFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    async function loadItems() {
      setLoading(true);
      try {
        const res = await getPublicFoundItems({
          limit: 12,
          category: selectedCategory || undefined,
          search: search.trim() || undefined,
          sortBy: 'foundDate',
          sortOrder: 'desc',
        });
        setItems(res.data || []);
      } catch (err) {
        console.error('Failed to fetch public items:', err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadItems();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Directory Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-400/30 px-3.5 py-1 rounded-full text-xs font-semibold text-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Public Live Inventory</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Items Currently Recovered on Campus
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Anyone can freely search and inspect items found across university buildings. 
              Private characteristics and full owner serials are securely masked until verified.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl flex items-center space-x-3 text-xs text-slate-200 shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-white">Open Campus Directory:</strong><br />
              Browse items freely — sign in only when claiming ownership.
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by item name, model, campus building..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 rounded-2xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all backdrop-blur-md"
            />
          </div>

          {/* Category Filter Pills (Scrollable) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {CATEGORY_TABS.map((cat) => {
              const active = selectedCategory === cat.value;
              return (
                <button
                  key={cat.label}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-400/40'
                      : 'bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white border border-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-gray-900 text-lg sm:text-xl">
              Available Items ({items.length})
            </h3>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
              Live Feed
            </span>
          </div>

          <Link
            href="/found-items"
            className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            <span>View Full Inventory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-gray-200 p-4 space-y-4 animate-pulse shadow-sm"
              >
                <div className="aspect-[16/10] bg-gray-200 rounded-xl" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <Search className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-gray-900">No items match your criteria</h4>
            <p className="text-sm text-gray-500">
              Try adjusting your search terms or category filter to discover items found in other buildings.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const mainImage = item.publicImages?.[0] || null;
              const formattedDate = item.foundDate
                ? new Date(item.foundDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Recent';

              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl border border-gray-200 hover:border-blue-400 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Image / Thumbnail Preview */}
                    <div className="relative aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                      {mainImage ? (
                        <img
                          src={mainImage}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                          <ImageIcon className="w-8 h-8 mb-1" />
                          <span className="text-xs font-medium">Campus Item</span>
                        </div>
                      )}

                      {/* Category Badge */}
                      <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                        {item.category.replace('_', ' ')}
                      </span>

                      {/* Privacy Shield Pill */}
                      <span className="absolute top-3 right-3 bg-blue-600/85 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Protected</span>
                      </span>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 space-y-2.5">
                      <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 text-base">
                        {item.title}
                      </h4>

                      {/* Short Description Preview (NOT full description for privacy) */}
                      <p className="text-xs text-gray-600 line-clamp-1">
                        {item.publicDescription || 'Found item logged by campus finder.'}
                      </p>

                      {/* Location & Date */}
                      <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1 max-w-[65%] truncate">
                          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="truncate">{item.foundLocation}</span>
                        </div>
                        <div className="flex items-center space-x-1 shrink-0">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="px-5 pb-5 pt-0">
                    <Link
                      href={`/found-items/${item.id}`}
                      className="w-full py-2.5 px-4 bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white font-semibold text-xs rounded-xl transition-all border border-slate-200 hover:border-transparent flex items-center justify-center space-x-1.5 shadow-sm group-hover:shadow-md"
                    >
                      <span>Inspect & Claim Item</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Gentle Bottom Banner */}
      <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            Did you lose an item that is not listed here yet?
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            File a quick lost report. Our AI matching engine scans future found item submissions automatically.
          </p>
        </div>
        <Link
          href="/lost-reports/new"
          className="shrink-0 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
        >
          Report Missing Item
        </Link>
      </div>
    </section>
  );
}
