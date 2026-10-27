import Link from 'next/link';
import { LostReport } from '@findora/types';
import { LostReportStatusBadge } from './LostReportStatusBadge';
import { Calendar, MapPin, Tag, Lock, ArrowRight } from 'lucide-react';

interface LostReportCardProps {
  report: LostReport;
}

export function LostReportCard({ report }: LostReportCardProps) {
  const primaryImage =
    report.images && report.images.length > 0 ? report.images[0] : null;

  const formattedDate = new Date(report.lostDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div className="p-5 space-y-4">
        {/* Header & Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
              <Tag className="w-3 h-3 text-gray-500" />
              <span>{report.category}</span>
            </span>
            <h3 className="font-bold text-gray-900 text-base line-clamp-1">
              {report.title}
            </h3>
          </div>
          <LostReportStatusBadge status={report.status} />
        </div>

        {/* Optional Image Preview */}
        {primaryImage ? (
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
            <img
              src={primaryImage}
              alt={report.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-xs text-gray-500 flex items-center space-x-2">
            <Lock className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="line-clamp-2">{report.description}</span>
          </div>
        )}

        {/* Details */}
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{report.lostLocation}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>Lost on {formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="px-5 py-3.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
        <span className="inline-flex items-center text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
          <Lock className="w-3 h-3 mr-1" />
          Private Report
        </span>
        <Link
          href={`/lost-reports/${report.id}`}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
