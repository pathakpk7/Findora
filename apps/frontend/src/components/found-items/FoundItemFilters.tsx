"use client";

import { useEffect, useState } from 'react';
import { ItemCategory } from '@findora/types';
import { Search, MapPin, Filter, ArrowUpDown, X } from 'lucide-react';

interface FoundItemFiltersProps {
  initialSearch?: string;
  initialCategory?: string;
  initialLocation?: string;
  initialDateFrom?: string;
  initialDateTo?: string;
  initialSortBy?: 'createdAt' | 'foundDate';
  initialSortOrder?: 'asc' | 'desc';
  onFilterChange: (filters: {
    search: string;
    category: string;
    foundLocation: string;
    dateFrom: string;
    dateTo: string;
    sortBy: 'createdAt' | 'foundDate';
    sortOrder: 'asc' | 'desc';
  }) => void;
}

const CATEGORY_OPTIONS = [
  { label: 'All Categories', value: '' },
  { label: 'Electronics', value: ItemCategory.ELECTRONICS },
  { label: 'Phones', value: ItemCategory.PHONE },
  { label: 'Earbuds & Audio', value: ItemCategory.EARBUDS },
  { label: 'Watches', value: ItemCategory.WATCH },
  { label: 'Wallets', value: ItemCategory.WALLET },
  { label: 'Cash', value: ItemCategory.CASH },
  { label: 'Books', value: ItemCategory.BOOK },
  { label: 'Notebooks', value: ItemCategory.NOTEBOOK },
  { label: 'ID Cards', value: ItemCategory.ID_CARD },
  { label: 'Student Cards', value: ItemCategory.STUDENT_CARD },
  { label: 'Keys', value: ItemCategory.KEYS },
  { label: 'Bags & Backpacks', value: ItemCategory.BAG },
  { label: 'Clothing', value: ItemCategory.CLOTHING },
  { label: 'Accessories', value: ItemCategory.ACCESSORY },
  { label: 'Chargers & Cables', value: ItemCategory.CHARGER },
  { label: 'Other', value: ItemCategory.OTHER },
];

export function FoundItemFilters({
  initialSearch = '',
  initialCategory = '',
  initialLocation = '',
  initialDateFrom = '',
  initialDateTo = '',
  initialSortBy = 'createdAt',
  initialSortOrder = 'desc',
  onFilterChange,
}: FoundItemFiltersProps) {
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [foundLocation, setFoundLocation] = useState(initialLocation);
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);
  const [sortBy, setSortBy] = useState<'createdAt' | 'foundDate'>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

  useEffect(() => {
    setSearch(initialSearch);
    setCategory(initialCategory);
    setFoundLocation(initialLocation);
    setDateFrom(initialDateFrom);
    setDateTo(initialDateTo);
    setSortBy(initialSortBy);
    setSortOrder(initialSortOrder);
  }, [
    initialSearch,
    initialCategory,
    initialLocation,
    initialDateFrom,
    initialDateTo,
    initialSortBy,
    initialSortOrder,
  ]);

  // Debounced filter submission
  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange({
        search,
        category,
        foundLocation,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
      });
    }, 300);

    return () => clearTimeout(handler);
  }, [
    search,
    category,
    foundLocation,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
    onFilterChange,
  ]);

  const handleClear = () => {
    setSearch('');
    setCategory('');
    setFoundLocation('');
    setDateFrom('');
    setDateTo('');
    setSortBy('createdAt');
    setSortOrder('desc');
    onFilterChange({
      search: '',
      category: '',
      foundLocation: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters = Boolean(
    search || category || foundLocation || dateFrom || dateTo,
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Search & Main Category/Location Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords (e.g. Earbuds, Wallet)..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Category Dropdown */}
        <div className="relative">
          <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none text-gray-700"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location Input */}
        <div className="relative">
          <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={foundLocation}
            onChange={(e) => setFoundLocation(e.target.value)}
            placeholder="Filter location (e.g. Library)..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Date Range & Sort Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
        <div className="relative flex items-center space-x-2">
          <span className="text-xs font-medium text-gray-500 shrink-0">From:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative flex items-center space-x-2">
          <span className="text-xs font-medium text-gray-500 shrink-0">To:</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Sort Select */}
        <div className="relative">
          <ArrowUpDown className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={`${sortBy}:${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split(':') as [
                'createdAt' | 'foundDate',
                'asc' | 'desc',
              ];
              setSortBy(sb);
              setSortOrder(so);
            }}
            className="w-full pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-gray-700"
          >
            <option value="createdAt:desc">Sort: Recently Reported</option>
            <option value="createdAt:asc">Sort: Oldest Reported</option>
            <option value="foundDate:desc">Sort: Found Date (Newest)</option>
            <option value="foundDate:asc">Sort: Found Date (Oldest)</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
          <span>Active search filters</span>
          <button
            onClick={handleClear}
            className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        </div>
      )}
    </div>
  );
}
