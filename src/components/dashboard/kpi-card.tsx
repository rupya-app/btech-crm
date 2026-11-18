import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';

interface KPICardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    period?: string;
  };
  href?: string;
  subtitle?: string;
  className?: string;
}

export function KPICard({
  label,
  value,
  icon: Icon,
  iconBg = 'bg-primary-50',
  iconColor = 'text-primary-600',
  trend,
  href,
  subtitle,
  className,
}: KPICardProps) {
  const content = (
    <div
      className={cn(
        'group relative flex flex-col justify-between p-5 rounded-2xl bg-surface border border-border shadow-xs hover:shadow-md transition-all duration-200',
        href && 'cursor-pointer hover:border-primary-200',
        className
      )}
    >
      {/* Top row: Label & Icon */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary">{label}</span>
        <div className={cn('p-2.5 rounded-xl transition-transform duration-150 group-hover:scale-105', iconBg)}>
          <Icon className={cn('w-4 h-4', iconColor)} />
        </div>
      </div>

      {/* Middle row: Large KPI Value */}
      <div className="mt-3">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary tabular-nums">
          {formatNumber(value)}
        </span>
      </div>

      {/* Bottom row: Trend or Subtitle */}
      <div className="mt-3 pt-3 border-t border-border-light flex items-center justify-between text-xs">
        {trend ? (
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-semibold',
                trend.isPositive
                  ? 'bg-success-bg text-success'
                  : 'bg-danger-bg text-danger'
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(trend.value)}%
            </span>
            <span className="text-text-muted text-[11px]">{trend.period || 'vs last month'}</span>
          </div>
        ) : subtitle ? (
          <span className="text-text-muted text-[11px]">{subtitle}</span>
        ) : (
          <span className="text-text-muted text-[11px]">Real-time tracking</span>
        )}

        {href && (
          <ArrowUpRight className="w-3.5 h-3.5 text-text-muted group-hover:text-primary-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
