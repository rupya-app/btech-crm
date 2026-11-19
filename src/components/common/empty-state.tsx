import React from 'react';
import { LucideIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = AlertCircle,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'w-full py-16 px-6 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-border shadow-xs my-4',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#E8F3F1] text-[#0E5F58] flex items-center justify-center mb-4 shadow-2xs">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-text-primary mb-1">
        {title}
      </h3>
      <p className="text-sm text-text-muted max-w-sm leading-relaxed mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
