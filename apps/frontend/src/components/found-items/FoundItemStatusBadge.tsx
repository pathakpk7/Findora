"use client";

import { ItemStatus } from '@findora/types';

interface FoundItemStatusBadgeProps {
  status: ItemStatus | string;
}

export function FoundItemStatusBadge({ status }: FoundItemStatusBadgeProps) {
  switch (status) {
    case ItemStatus.PENDING:
    case 'PENDING':
      return (
        <span className="inline-flex items-center space-x-1.5 text-xs font-medium text-amber-800">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>Awaiting Review</span>
        </span>
      );

    case ItemStatus.APPROVED:
    case 'APPROVED':
      return (
        <span className="inline-flex items-center space-x-1.5 text-xs font-medium text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Published</span>
        </span>
      );

    case ItemStatus.REJECTED:
    case 'REJECTED':
      return (
        <span className="inline-flex items-center space-x-1.5 text-xs font-medium text-stone-500">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
          <span>Needs Attention</span>
        </span>
      );

    case ItemStatus.CLAIMED:
    case 'CLAIMED':
    case ItemStatus.RETURNED:
    case 'RETURNED':
      return (
        <span className="inline-flex items-center space-x-1.5 text-xs font-medium text-blue-800">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          <span>Recovered</span>
        </span>
      );

    case ItemStatus.ARCHIVED:
    case 'ARCHIVED':
      return (
        <span className="inline-flex items-center space-x-1.5 text-xs font-medium text-stone-400">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
          <span>Archived</span>
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center space-x-1.5 text-xs font-medium text-stone-600">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
          <span>{String(status)}</span>
        </span>
      );
  }
}
