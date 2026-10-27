import Link from 'next/link';
import { ShieldCheck, Search } from 'lucide-react';

interface EmptyClaimsProps {
  onClearFilters?: () => void;
}

export function EmptyClaims({ onClearFilters }: EmptyClaimsProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
      <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
        <ShieldCheck className="w-7 h-7" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-gray-900">No Ownership Claims Found</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          {onClearFilters
            ? 'No claims match your status filter. Try clearing filters or browsing found items.'
            : 'You haven’t submitted any item ownership claims yet. If you recognize an item in the public inventory, file a claim.'}
        </p>
      </div>
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        )}
        <Link
          href="/found-items"
          className="w-full sm:w-auto px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center justify-center space-x-1.5 shadow-sm"
        >
          <Search className="w-4 h-4" />
          <span>Browse Public Inventory</span>
        </Link>
      </div>
    </div>
  );
}
