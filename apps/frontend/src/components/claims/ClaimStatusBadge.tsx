import { ClaimStatus } from '@findora/types';

interface ClaimStatusBadgeProps {
  status: ClaimStatus;
}

export function ClaimStatusBadge({ status }: ClaimStatusBadgeProps) {
  const configs: Record<
    ClaimStatus,
    { label: string; dot: string; text: string }
  > = {
    [ClaimStatus.PENDING]: {
      label: 'Pending Review',
      dot: 'bg-amber-500 animate-pulse',
      text: 'text-amber-800',
    },
    [ClaimStatus.UNDER_REVIEW]: {
      label: 'Staff Review Underway',
      dot: 'bg-blue-600 animate-pulse',
      text: 'text-blue-800',
    },
    [ClaimStatus.APPROVED]: {
      label: 'Claim Approved',
      dot: 'bg-emerald-600',
      text: 'text-emerald-800',
    },
    [ClaimStatus.REJECTED]: {
      label: 'Claim Rejected',
      dot: 'bg-stone-400',
      text: 'text-stone-500',
    },
    [ClaimStatus.CANCELLED]: {
      label: 'Cancelled',
      dot: 'bg-stone-300',
      text: 'text-stone-400',
    },
    [ClaimStatus.COMPLETED]: {
      label: 'Handover Completed',
      dot: 'bg-emerald-600',
      text: 'text-emerald-800',
    },
  };

  const config = configs[status] || {
    label: String(status),
    dot: 'bg-stone-400',
    text: 'text-stone-500',
  };

  return (
    <span className={`inline-flex items-center space-x-1.5 text-xs font-medium ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}
