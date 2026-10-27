"use client";

import { ItemStatus } from '@findora/types';
import { Clock, CheckCircle2, XCircle, PackageCheck, Archive } from 'lucide-react';

interface FoundItemStatusBadgeProps {
  status: ItemStatus | string;
}

export function FoundItemStatusBadge({ status }: FoundItemStatusBadgeProps) {
  switch (status) {
    case ItemStatus.PENDING:
    case 'PENDING':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3" />
          <span>Awaiting Review</span>
        </span>
      );

    case ItemStatus.APPROVED:
    case 'APPROVED':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" />
          <span>Published</span>
        </span>
      );

    case ItemStatus.REJECTED:
    case 'REJECTED':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          <XCircle className="w-3 h-3" />
          <span>Needs Attention</span>
        </span>
      );

    case ItemStatus.CLAIMED:
    case 'CLAIMED':
    case ItemStatus.RETURNED:
    case 'RETURNED':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
          <PackageCheck className="w-3 h-3" />
          <span>Recovered</span>
        </span>
      );

    case ItemStatus.ARCHIVED:
    case 'ARCHIVED':
    case ItemStatus.EXPIRED:
    case 'EXPIRED':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
          <Archive className="w-3 h-3" />
          <span>Archived</span>
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
          {status}
        </span>
      );
  }
}
