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
  accentColor?: string;
  stageTag?: string;
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
  accentColor = '#147D72',
  stageTag,
  trend,
  href,
  subtitle,
  className,
}: KPICardProps) {
  const content = (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-2xl bg-white border border-border shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden',
        href && 'cursor-pointer hover:border-primary-300',
        className
      )}
      style={{
        padding: '22px 24px',
        minHeight: '164px',
        borderTop: `3.5px solid ${accentColor}`,
      }}
    >
      {/* Top row: Label & Icon */}
      <div className="flex items-start justify-between" style={{ gap: '12px' }}>
        <div className="flex flex-col" style={{ gap: '4px' }}>
          <span className="text-[13px] font-semibold text-text-secondary tracking-wide">
            {label}
          </span>
          {stageTag && (
            <span
              className="inline-flex items-center self-start rounded-full text-[10.5px] font-bold uppercase tracking-wider"
              style={{
                padding: '2px 8px',
                backgroundColor: `${accentColor}15`,
                color: accentColor,
              }}
            >
              {stageTag}
            </span>
          )}
        </div>
        <div
          className={cn(
            'rounded-xl transition-transform duration-150 group-hover:scale-105 flex items-center justify-center shrink-0',
            iconBg
          )}
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: `${accentColor}14`,
            color: accentColor,
          }}
        >
          <Icon className={cn('w-4 h-4', iconColor)} style={{ color: accentColor }} />
        </div>
      </div>

      {/* Middle row: Large KPI Value */}
      <div style={{ margin: '14px 0' }}>
        <span className="text-[32px] font-bold tracking-tight text-text-primary tabular-nums leading-none">
          {formatNumber(value)}
        </span>
      </div>

      {/* Bottom row: Trend or Subtitle */}
      <div
        className="border-t border-border-light flex items-center justify-between text-xs"
        style={{ paddingTop: '12px', marginTop: 'auto' }}
      >
        {trend ? (
          <div className="flex items-center" style={{ gap: '8px' }}>
            <span
              className={cn(
                'inline-flex items-center rounded-full text-[11.5px] font-bold',
                trend.isPositive
                  ? 'bg-success-bg text-success'
                  : 'bg-danger-bg text-danger'
              )}
              style={{ padding: '2px 8px', gap: '4px' }}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(trend.value)}%
            </span>
            <span className="text-text-muted text-[12px]">{trend.period || 'vs last month'}</span>
          </div>
        ) : subtitle ? (
          <span className="text-text-muted text-[12px] font-medium">{subtitle}</span>
        ) : (
          <span className="text-text-muted text-[12px]">Real-time stage metric</span>
        )}

        {href && (
          <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-primary-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
}
