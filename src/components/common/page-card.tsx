import React from 'react';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

interface PageCardProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function PageCard({ id, children, className, hover, onClick, style }: PageCardProps) {
  return (
    <div
      id={id}
      className={cn(
        'p-6 rounded-2xl bg-surface border border-border shadow-xs',
        hover && 'hover:border-primary-300 hover:shadow-md transition-all',
        onClick && 'cursor-pointer',
        className
      )}
      style={{ padding: '24px', ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface PageCardHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
}

export function PageCardHeader({ title, description, icon: Icon, actions, className }: PageCardHeaderProps) {
  return (
    <div
      className={cn('flex items-center justify-between gap-4 pb-4 border-b border-border-light mb-5', className)}
      style={{ paddingBottom: '16px', marginBottom: '20px' }}
    >
      <div className="flex items-center gap-3" style={{ gap: '12px' }}>
        {Icon && (
          <div
            className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 border border-primary-100"
          >
            <Icon className="w-4 h-4 shrink-0" />
          </div>
        )}
        <div>
          <h2 className="text-[16px] font-bold text-text-primary leading-snug">{title}</h2>
          {description && (
            <p className="text-[13px] text-text-muted mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
}
