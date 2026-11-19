import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Unified page header used by every route.
 * Title: 28px / 700 weight.
 * Description: 14px / muted.
 * Actions: right-aligned on desktop, below on mobile.
 */
export function PageHeader({
  title,
  description,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1',
        className
      )}
      style={{ gap: '16px', paddingBottom: '4px' }}
    >
      <div className="min-w-0">
        {badge && <div style={{ marginBottom: '8px' }}>{badge}</div>}
        <h1 className="text-[28px] font-bold text-text-primary tracking-tight leading-tight">
          {title}
        </h1>
        {description && (
          <div
            className="text-[14px] text-text-muted leading-relaxed mt-1.5"
            style={{ marginTop: '6px' }}
          >
            {description}
          </div>
        )}
      </div>

      {actions && (
        <div
          className="flex items-center gap-3 shrink-0 flex-wrap"
          style={{ gap: '12px' }}
        >
          {actions}
        </div>
      )}
    </div>
  );
}
