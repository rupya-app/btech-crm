import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuccessNoticeProps {
  message: string;
  className?: string;
}

export function SuccessNotice({ message, className }: SuccessNoticeProps) {
  return (
    <div className={cn(
      'flex items-center gap-3 p-4 rounded-xl bg-success-bg border border-success/30 text-success text-[13px] font-semibold animate-in fade-in-50',
      className
    )}>
      <CheckCircle2 className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
