import React from 'react';
import Link from 'next/link';
import { type LucideIcon, ArrowUpRight } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  subtitle?: string;
  href?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconBg = 'bg-[#E8F3F1]',
  iconColor = 'text-[#0E5F58]',
  subtitle,
  href,
  className,
}: StatCardProps) {
  const content = (
    <div
      className={cn(
        'p-5 sm:p-6 rounded-2xl bg-white border border-border shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[148px]',
        href && 'cursor-pointer hover:border-[#24988A]/50 group',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-secondary tracking-wide uppercase">
          {label}
        </span>
        {Icon && (
          <div className={cn('p-2.5 rounded-xl transition-transform duration-150', iconBg)}>
            <Icon className={cn('w-4 h-4', iconColor)} />
          </div>
        )}
      </div>

      <div className="my-2.5">
        <span className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary tabular-nums">
          {typeof value === 'number' ? formatNumber(value) : value}
        </span>
      </div>

      <div className="pt-2.5 border-t border-border-light flex items-center justify-between text-xs text-text-muted">
        <span>{subtitle || 'Real-time record'}</span>
        {href && (
          <ArrowUpRight className="w-3.5 h-3.5 text-text-muted group-hover:text-primary-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
}
