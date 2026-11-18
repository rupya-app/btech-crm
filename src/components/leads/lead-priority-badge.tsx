import React from 'react';
import { cn } from '@/lib/utils';
import { LeadPriority } from '@/types';

interface LeadPriorityBadgeProps {
  priority: LeadPriority | string;
  className?: string;
}

export function LeadPriorityBadge({ priority, className }: LeadPriorityBadgeProps) {
  const norm = priority.toLowerCase();

  let color = 'text-text-muted bg-surface-muted border-border';
  let dotColor = 'bg-text-muted';
  let label = priority;

  switch (norm) {
    case 'critical':
      color = 'text-danger bg-danger-bg border-danger/20';
      dotColor = 'bg-danger';
      label = 'Critical';
      break;
    case 'high':
      color = 'text-warning bg-warning-bg border-warning/20';
      dotColor = 'bg-warning';
      label = 'High';
      break;
    case 'medium':
      color = 'text-accent-blue bg-accent-blueSoft border-accent-blue/20';
      dotColor = 'bg-accent-blue';
      label = 'Medium';
      break;
    case 'low':
      color = 'text-text-secondary bg-surface-muted border-border';
      dotColor = 'bg-text-secondary';
      label = 'Low';
      break;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border',
        color,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', dotColor)} />
      {label}
    </span>
  );
}
