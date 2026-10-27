import { LostReportStatus } from '@findora/types';
import { Clock, CheckCircle2, XCircle, Search, AlertTriangle, Archive } from 'lucide-react';

interface LostReportStatusBadgeProps {
  status: LostReportStatus;
}

export function LostReportStatusBadge({ status }: LostReportStatusBadgeProps) {
  const configs: Record<
    LostReportStatus,
    { label: string; bg: string; text: string; border: string; icon: any }
  > = {
    [LostReportStatus.ACTIVE]: {
      label: 'Active Search',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: Search,
    },
    [LostReportStatus.MATCHED]: {
      label: 'Potential Match',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      icon: Clock,
    },
    [LostReportStatus.RECOVERED]: {
      label: 'Recovered',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: CheckCircle2,
    },
    [LostReportStatus.CLOSED]: {
      label: 'Closed',
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-300',
      icon: Archive,
    },
    [LostReportStatus.CANCELLED]: {
      label: 'Cancelled',
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: XCircle,
    },
    [LostReportStatus.EXPIRED]: {
      label: 'Expired',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: AlertTriangle,
    },
  };

  const config = configs[status] || configs[LostReportStatus.ACTIVE];
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
