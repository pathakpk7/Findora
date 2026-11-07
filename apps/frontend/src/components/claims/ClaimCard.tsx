import Link from 'next/link';
import { Claim } from '@findora/types';
import { ClaimStatusBadge } from './ClaimStatusBadge';
import { Calendar, Lock, ArrowUpRight } from 'lucide-react';

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
    <div className="bg-white rounded-md border border-stone-200/80 hover:border-stone-400 transition-all duration-300 flex flex-col justify-between">
      <div className="p-5 space-y-4">
        {/* Header & Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">
              {itemCategory.replace('_', ' ')}
            </span>
            <h3 className="font-semibold text-stone-900 text-base line-clamp-1">
              {itemTitle}
            </h3>
          </div>
          <ClaimStatusBadge status={claim.status} />
        </div>

        {/* Private Evidence Preview */}
        <div className="p-3 bg-stone-50 rounded border border-stone-200/60 text-xs text-stone-600 space-y-1">
          <div className="flex items-center space-x-1.5 font-medium text-stone-900">
            <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>Private Evidence Statement</span>
          </div>
          <p className="line-clamp-2 text-stone-600 leading-relaxed">{claim.evidence}</p>
        </div>

        {/* Submission Date */}
        <div className="flex items-center space-x-1.5 text-xs text-stone-500">
          <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span>Filed on {formattedDate}</span>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="px-5 py-3 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between text-xs">
        <span className="text-stone-400 font-mono text-[11px]">ID: {claim.id.slice(0, 8)}</span>
        <Link
          href={`/claims/${claim.id}`}
          className="inline-flex items-center space-x-1 font-medium text-stone-900 hover:text-blue-700 transition-colors"
        >
          <span>View Claim Status</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
