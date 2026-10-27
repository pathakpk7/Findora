"use client";

import Link from 'next/link';
import { SearchX, PlusCircle, RotateCcw } from 'lucide-react';

interface EmptyFoundItemsProps {
  title?: string;
  description?: string;
  onClearFilters?: () => void;
  showReportButton?: boolean;
}

export function EmptyFoundItems({
  title = 'No found items found',
  description = 'Try broadening your search keywords or resetting category/location filters.',
  onClearFilters,
  showReportButton = true,
}: EmptyFoundItemsProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-8">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
        <SearchX className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 mb-6">{description}</p>

      <div className="flex flex-wrap gap-3 justify-center">
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center space-x-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Filters</span>
          </button>
        )}

        {showReportButton && (
          <Link
            href="/found-items/new"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Found Item</span>
          </Link>
        )}
      </div>
    </div>
  );
}
