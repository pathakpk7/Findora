import Link from 'next/link';
import { Search, PlusCircle } from 'lucide-react';

interface EmptyLostReportsProps {
  onClearFilters?: () => void;
}

export function EmptyLostReports({ onClearFilters }: EmptyLostReportsProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
        <Search className="w-7 h-7" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-gray-900">No Lost Reports Found</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          {onClearFilters
            ? 'No reports match your current category/status filter. Try clearing filters or creating a new report.'
            : 'You haven’t filed any lost item reports yet. If you misplaced an item on campus, report it here.'}
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
          href="/lost-reports/new"
          className="w-full sm:w-auto px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center justify-center space-x-1.5 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Lost Item</span>
        </Link>
      </div>
    </div>
  );
}
