import { LostReportStatus } from '@findora/types';

interface LostReportStatusBadgeProps {
  status: LostReportStatus;
}

export function LostReportStatusBadge({ status }: LostReportStatusBadgeProps) {
  const configs: Record<
    LostReportStatus,
    { label: string; dot: string; text: string }
  > = {
    [LostReportStatus.ACTIVE]: {
      label: 'Active Search',
      dot: 'bg-blue-600 animate-pulse',
      text: 'text-blue-800',
    },
    [LostReportStatus.MATCHED]: {
      label: 'Potential Match',
      dot: 'bg-indigo-600 animate-pulse',
      text: 'text-indigo-800',
    },
    [LostReportStatus.RECOVERED]: {
      label: 'Recovered',
      dot: 'bg-emerald-600',
      text: 'text-emerald-800',
    },
    [LostReportStatus.CLOSED]: {
      label: 'Closed',
      dot: 'bg-stone-400',
      text: 'text-stone-500',
    },
    [LostReportStatus.CANCELLED]: {
      label: 'Cancelled',
      dot: 'bg-stone-300',
      text: 'text-stone-400',
    },
    [LostReportStatus.EXPIRED]: {
      label: 'Expired',
      dot: 'bg-amber-500',
      text: 'text-amber-800',
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
