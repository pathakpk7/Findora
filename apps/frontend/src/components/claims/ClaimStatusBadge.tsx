import { ClaimStatus } from '@findora/types';
import { Clock, CheckCircle2, XCircle, AlertCircle, Archive } from 'lucide-react';

interface ClaimStatusBadgeProps {
  status: ClaimStatus;
}

export function ClaimStatusBadge({ status }: ClaimStatusBadgeProps) {
  const configs: Record<
    ClaimStatus,
    { label: string; bg: string; text: string; border: string; icon: any }
  > = {
    [ClaimStatus.PENDING]: {
      label: 'Pending Review',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: Clock,
    },
    [ClaimStatus.UNDER_REVIEW]: {
      label: 'Under Review',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      icon: AlertCircle,
    },
    [ClaimStatus.APPROVED]: {
      label: 'Claim Approved',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: CheckCircle2,
    },
    [ClaimStatus.REJECTED]: {
      label: 'Claim Rejected',
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: XCircle,
    },
    [ClaimStatus.CANCELLED]: {
      label: 'Cancelled',
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-300',
      icon: Archive,
    },
    [ClaimStatus.COMPLETED]: {
      label: 'Handover Completed',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: CheckCircle2,
    },
  };

  const config = configs[status] || configs[ClaimStatus.PENDING];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
}
