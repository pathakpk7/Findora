import { HandoverStatus } from '@findora/types';

interface HandoverStatusBadgeProps {
  status: HandoverStatus;
}

export function HandoverStatusBadge({ status }: HandoverStatusBadgeProps) {
  const configs: Record<
    HandoverStatus,
    { label: string; dot: string; text: string }
  > = {
    [HandoverStatus.PENDING]: {
      label: 'Handover Active',
      dot: 'bg-emerald-500 animate-pulse',
      text: 'text-emerald-800',
    },
    [HandoverStatus.SCANNED]: {
      label: 'Token Scanned',
      dot: 'bg-blue-600',
      text: 'text-blue-800',
    },
    [HandoverStatus.COMPLETED]: {
      label: 'Returned & Completed',
      dot: 'bg-emerald-600',
      text: 'text-emerald-800',
    },
    [HandoverStatus.EXPIRED]: {
      label: 'QR Expired',
      dot: 'bg-stone-400',
      text: 'text-stone-500',
    },
    [HandoverStatus.CANCELLED]: {
      label: 'Cancelled',
      dot: 'bg-stone-300',
      text: 'text-stone-400',
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
