import React from 'react';
import { cn } from '@/lib/utils';

interface PageSectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function PageSection({
  children,
  title,
  description,
  actions,
  className,
  noPadding,
}: PageSectionProps) {
  return (
    <section className={cn('rounded-2xl border border-border bg-surface shadow-xs', className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-border-light">
          <div>
            {title && (
              <h2 className="text-[15px] font-semibold text-text-primary">{title}</h2>
            )}
            {description && (
              <p className="text-[13px] text-text-muted mt-0.5">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          )}
        </div>
      )}
      <div className={cn(!noPadding && 'p-5 sm:p-6')}>
        {children}
      </div>
    </section>
  );
}
