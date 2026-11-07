import Link from 'next/link';
import { LostReport } from '@findora/types';
import { LostReportStatusBadge } from './LostReportStatusBadge';
import { Calendar, MapPin, Lock, ArrowUpRight } from 'lucide-react';

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
    <div className="bg-white rounded-md border border-stone-200/80 hover:border-stone-400 transition-all duration-300 flex flex-col justify-between">
      <div className="p-5 space-y-4">
        {/* Header & Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">
              {report.category.replace('_', ' ')}
            </span>
            <h3 className="font-semibold text-stone-900 text-base line-clamp-1">
              {report.title}
            </h3>
          </div>
          <LostReportStatusBadge status={report.status} />
        </div>

        {/* Optional Image Preview */}
        {primaryImage ? (
          <div className="relative aspect-[16/9] rounded overflow-hidden bg-stone-100 border border-stone-100">
            <img
              src={primaryImage}
              alt={report.title}
              className="w-full h-full object-cover grayscale-[15%]"
            />
          </div>
        ) : (
          <div className="p-3 bg-stone-50 rounded border border-stone-200/60 text-xs text-stone-500 flex items-center space-x-2">
            <Lock className="w-4 h-4 text-stone-400 shrink-0" />
            <span className="line-clamp-2">{report.description}</span>
          </div>
        )}

        {/* Details */}
        <div className="space-y-1.5 text-xs text-stone-600">
          <div className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="truncate">{report.lostLocation}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>Misplaced {formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="px-5 py-3 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between">
        <span className="inline-flex items-center text-[11px] text-stone-500">
          <Lock className="w-3 h-3 mr-1 text-stone-400" />
          Private Report
        </span>
        <Link
          href={`/lost-reports/${report.id}`}
          className="inline-flex items-center space-x-1 text-xs font-medium text-stone-900 hover:text-blue-700 transition-colors"
        >
          <span>Inspect Notice</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
