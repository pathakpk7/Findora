"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PublicFoundItem, ItemCategory } from '@findora/types';
import { getPublicFoundItems } from '@/lib/foundItemsApi';
import { 
  Search, 
  MapPin, 
  Calendar, 
  ArrowUpRight, 
  ShieldCheck, 
  Image as ImageIcon,
  Lock
} from 'lucide-react';

const CATEGORY_TABS: { label: string; value: string }[] = [
  { label: 'All Items', value: '' },
  { label: 'Electronics', value: ItemCategory.ELECTRONICS },
  { label: 'Audio & Earbuds', value: ItemCategory.EARBUDS },
  { label: 'Wallets & Identification', value: ItemCategory.WALLET },
  { label: 'ID Cards', value: ItemCategory.ID_CARD },
  { label: 'Keys', value: ItemCategory.KEYS },
  { label: 'Academic & Books', value: ItemCategory.BOOK },
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
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-stone-200">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-700 tracking-wide">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse-dot" />
            <span>Campus Registry</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900">
            Current Items in Custody
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Browse discovered items cataloged across campus facilities. Identifying marks and serial numbers are protected until authorized verification.
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-80 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by item, room, or building"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-md text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
          />
        </div>
      </div>

      {/* Category Navigation Strip */}
      <div className="flex items-center space-x-2 overflow-x-auto py-5 no-scrollbar border-b border-stone-200/60 mb-10 text-xs font-medium">
        {CATEGORY_TABS.map((cat) => {
          const active = selectedCategory === cat.value;
          return (
            <button
              key={cat.label}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3.5 py-1.5 rounded transition-all whitespace-nowrap ${
                active
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="space-y-4 animate-pulse">
              <div className="aspect-[4/3] bg-stone-100 rounded-md" />
              <div className="h-4 bg-stone-100 rounded w-2/3" />
              <div className="h-3 bg-stone-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto space-y-4">
          <p className="text-stone-900 font-semibold text-lg">
            {search || selectedCategory ? 'No matching items located' : 'Inventory is currently clear'}
          </p>
          <p className="text-stone-500 text-sm leading-relaxed">
            {search || selectedCategory
              ? 'Try modifying your search query or selecting a different category filter.'
              : 'All cataloged property has been returned to verified owners. If you recently found an item, register it below.'}
          </p>
          {search || selectedCategory ? (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('');
              }}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline"
            >
              Clear filters
            </button>
          ) : (
            <Link
              href="/found-items/new"
              className="inline-flex items-center justify-center px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded-md hover:bg-stone-800 transition-colors"
            >
              Report a Found Item
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => {
            const mainImage = item.publicImages?.[0] || null;
            const formattedDate = item.foundDate
              ? new Date(item.foundDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              : 'Recent';

            return (
              <Link
                key={item.id}
                href={`/found-items/${item.id}`}
                className="group block space-y-3"
              >
                {/* Visual Asset Container */}
                <div className="relative aspect-[4/3] bg-stone-100 rounded-md overflow-hidden border border-stone-200/70">
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt={item.title}
                      className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 ease-out"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
                      <ImageIcon className="w-7 h-7 mb-1.5 stroke-1" />
                      <span className="text-xs">Visual unavailable</span>
                    </div>
                  )}

                  {/* Top Masked Badge */}
                  <div className="absolute top-3 right-3 bg-stone-950/80 backdrop-blur-sm text-stone-200 text-[11px] font-medium px-2 py-0.5 rounded flex items-center space-x-1">
                    <Lock className="w-3 h-3 text-stone-300" />
                    <span>Protected</span>
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-medium text-stone-700">
                      {item.category.replace('_', ' ')}
                    </span>
                    <span>{formattedDate}</span>
                  </div>

                  <h3 className="font-semibold text-stone-900 group-hover:text-blue-700 transition-colors line-clamp-1 text-base">
                    {item.title}
                  </h3>

                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {item.publicDescription || 'Cataloged property under campus department custody.'}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs text-stone-600 border-t border-stone-100">
                    <div className="flex items-center space-x-1 truncate max-w-[70%]">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{item.foundLocation}</span>
                    </div>
                    <span className="inline-flex items-center space-x-0.5 font-medium text-stone-900 group-hover:text-blue-700 transition-colors">
                      <span>View details</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Directory Footer Action */}
      <div className="mt-16 pt-8 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-stone-900">
            Lost an item that is not in the directory?
          </h4>
          <p className="text-xs text-stone-500 mt-0.5">
            File a confidential lost report to activate automatic background matching against future intake.
          </p>
        </div>
        <Link
          href="/lost-reports/new"
          className="inline-flex items-center justify-center px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-semibold rounded-md transition-colors whitespace-nowrap"
        >
          File Lost Notice
        </Link>
      </div>
    </section>
  );
}
