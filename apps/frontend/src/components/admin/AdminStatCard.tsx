"use client";

import { LucideIcon } from 'lucide-react';

interface AdminStatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  color: 'blue' | 'emerald' | 'amber' | 'indigo' | 'purple' | 'slate';
  trend?: string;
}

const COLOR_MAP = {
  blue: {
    bg: 'bg-blue-50 border-blue-100',
    iconBg: 'bg-blue-600 text-white',
    valueText: 'text-blue-950',
  },
  emerald: {
    bg: 'bg-emerald-50 border-emerald-100',
    iconBg: 'bg-emerald-600 text-white',
    valueText: 'text-emerald-950',
  },
  amber: {
    bg: 'bg-amber-50 border-amber-100',
    iconBg: 'bg-amber-500 text-white',
    valueText: 'text-amber-950',
  },
  indigo: {
    bg: 'bg-indigo-50 border-indigo-100',
    iconBg: 'bg-indigo-600 text-white',
    valueText: 'text-indigo-950',
  },
  purple: {
    bg: 'bg-purple-50 border-purple-100',
    iconBg: 'bg-purple-600 text-white',
    valueText: 'text-purple-950',
  },
  slate: {
    bg: 'bg-slate-50 border-slate-200',
    iconBg: 'bg-slate-700 text-white',
    valueText: 'text-slate-900',
  },
};

export function AdminStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
}: AdminStatCardProps) {
  const styles = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <div
      className={`p-5 rounded-3xl border ${styles.bg} shadow-sm transition-all hover:shadow-md space-y-3`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2.5 rounded-2xl ${styles.iconBg} shadow-sm`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div>
        <div className={`text-2xl sm:text-3xl font-black ${styles.valueText}`}>
          {value}
        </div>
        {subtitle && (
          <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {trend && (
        <div className="pt-2 border-t border-slate-200/60 text-[10px] font-bold text-slate-600">
          {trend}
        </div>
      )}
    </div>
  );
}
