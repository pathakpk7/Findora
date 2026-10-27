import Link from 'next/link';
import { Claim } from '@findora/types';
import { ClaimStatusBadge } from './ClaimStatusBadge';
import { Calendar, Tag, Lock, ArrowRight } from 'lucide-react';

interface ClaimCardProps {
  claim: Claim & { foundItem?: any };
}

export function ClaimCard({ claim }: ClaimCardProps) {
  const itemTitle = claim.foundItem?.title || 'Claimed Found Item';
  const itemCategory = claim.foundItem?.category || 'ITEM';

  const formattedDate = new Date(claim.createdAt).toLocaleDateString('en-US', {
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
              <span>{itemCategory}</span>
            </span>
            <h3 className="font-bold text-gray-900 text-base line-clamp-1">
              {itemTitle}
            </h3>
          </div>
          <ClaimStatusBadge status={claim.status} />
        </div>

        {/* Private Evidence Preview */}
        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-xs text-amber-900 space-y-1">
          <div className="flex items-center space-x-1 font-semibold text-amber-950">
            <Lock className="w-3 h-3 text-amber-600 shrink-0" />
            <span>Private Evidence Statement</span>
          </div>
          <p className="line-clamp-2 italic text-gray-700">&quot;{claim.evidence}&quot;</p>
        </div>

        {/* Submission Date */}
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>Filed on {formattedDate}</span>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="px-5 py-3.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium">Claim ID: {claim.id.slice(0, 8)}...</span>
        <Link
          href={`/claims/${claim.id}`}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <span>View Claim Status</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
