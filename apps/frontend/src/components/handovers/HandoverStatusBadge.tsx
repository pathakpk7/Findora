import { HandoverStatus } from '@findora/types';
import { Clock, CheckCircle2, XCircle, AlertCircle, Archive } from 'lucide-react';

interface HandoverStatusBadgeProps {
  status: HandoverStatus;
}

export function HandoverStatusBadge({ status }: HandoverStatusBadgeProps) {
  const configs: Record<
    HandoverStatus,
    { label: string; bg: string; text: string; border: string; icon: any }
  > = {
    [HandoverStatus.PENDING]: {
      label: 'Handover Active',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: Clock,
    },
    [HandoverStatus.SCANNED]: {
      label: 'Scanned',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      icon: AlertCircle,
    },
    [HandoverStatus.COMPLETED]: {
      label: 'Returned & Completed',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: CheckCircle2,
    },
    [HandoverStatus.EXPIRED]: {
      label: 'QR Expired',
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: XCircle,
    },
    [HandoverStatus.CANCELLED]: {
      label: 'Cancelled',
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-300',
      icon: Archive,
    },
  };

  const config = configs[status] || configs[HandoverStatus.PENDING];
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
