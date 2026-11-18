import React from 'react';
import { cn } from '@/lib/utils';
import { LeadStatus } from '@/types';

interface LeadStatusBadgeProps {
  status: LeadStatus | string;
  className?: string;
}

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  const norm = status.toLowerCase().replace(/[\s-]/g, '_');

  let style = 'bg-surface-muted text-text-secondary border-border';
  let label = status;

  switch (norm) {
    case 'confirmed':
      style = 'bg-success-bg text-success border-success/30';
      label = 'Confirmed';
      break;
    case 'interested':
      style = 'bg-primary-50 text-primary-700 border-primary-200';
      label = 'Interested';
      break;
    case 'contacted':
      style = 'bg-accent-blueSoft text-accent-blue border-accent-blue/30';
      label = 'Contacted';
      break;
    case 'new':
      style = 'bg-info-bg text-info border-info/30';
      label = 'New';
      break;
    case 'pending':
      style = 'bg-warning-bg text-warning border-warning/30';
      label = 'Pending';
      break;
    case 'follow_up':
    case 'followup':
      style = 'bg-warning-bg text-warning border-warning/30';
      label = 'Follow-up';
      break;
    case 'not_interested':
    case 'notinterested':
      style = 'bg-danger-bg text-danger border-danger/30';
      label = 'Not Interested';
      break;
    case 'unqualified':
    case 'invalid':
      style = 'bg-danger-bg text-danger border-danger/30';
      label = 'Invalid / Unqualified';
      break;
    case 'archived':
      style = 'bg-surface-muted text-text-muted border-border';
      label = 'Archived';
      break;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-colors',
        style,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 mr-1.5" />
      {label}
    </span>
  );
}
