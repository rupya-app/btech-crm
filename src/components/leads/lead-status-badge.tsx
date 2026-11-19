import React from 'react';
import { cn } from '@/lib/utils';
import { LeadStatus } from '@/types';

interface LeadStatusBadgeProps {
  status: LeadStatus | string;
  className?: string;
}

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  const norm = status.toLowerCase().replace(/[\s-]/g, '_');

  let bg = '#F1F5F9';
  let text = '#334155';
  let border = '#CBD5E1';
  let dot = '#64748B';
  let label: string = status;

  switch (norm) {
    case 'confirmed':
      bg = '#D1FAE5';
      text = '#065F46';
      border = '#6EE7B7';
      dot = '#10B981';
      label = 'Confirmed Won';
      break;
    case 'interested':
      bg = '#CCFBF1';
      text = '#115E59';
      border = '#5EEAD4';
      dot = '#14B8A6';
      label = 'Interested';
      break;
    case 'contacted':
      bg = '#DBEAFE';
      text = '#1E40AF';
      border = '#93C5FD';
      dot = '#3B82F6';
      label = 'Contacted';
      break;
    case 'new':
      bg = '#E0F2FE';
      text = '#075985';
      border = '#7DD3FC';
      dot = '#0EA5E9';
      label = 'New Inquiry';
      break;
    case 'unassigned':
      bg = '#EEF2FF';
      text = '#3730A3';
      border = '#A5B4FC';
      dot = '#6366F1';
      label = 'Unassigned Pool';
      break;
    case 'pending':
      bg = '#FEF3C7';
      text = '#92400E';
      border = '#FCD34D';
      dot = '#F59E0B';
      label = 'Pending Decision';
      break;
    case 'follow_up':
    case 'followup':
      bg = '#F3E8FF';
      text = '#5B21B6';
      border = '#C4B5FD';
      dot = '#8B5CF6';
      label = 'Follow-up Queue';
      break;
    case 'not_interested':
    case 'notinterested':
      bg = '#FFE4E6';
      text = '#9F1239';
      border = '#FDA4AF';
      dot = '#F43F5E';
      label = 'Closed Lost';
      break;
    case 'unqualified':
    case 'invalid':
      bg = '#FEE2E2';
      text = '#991B1B';
      border = '#FCA5A5';
      dot = '#EF4444';
      label = 'Disqualified';
      break;
    case 'archived':
      bg = '#F1F5F9';
      text = '#334155';
      border = '#CBD5E1';
      dot = '#64748B';
      label = 'Archived';
      break;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full text-[12px] font-semibold transition-colors whitespace-nowrap',
        className
      )}
      style={{
        padding: '4px 11px',
        gap: '6px',
        backgroundColor: bg,
        color: text,
        border: `1px solid ${border}`,
      }}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: dot }}
      />
      <span>{label}</span>
    </span>
  );
}
