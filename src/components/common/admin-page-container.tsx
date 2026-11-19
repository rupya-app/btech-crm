import React from 'react';
import { cn } from '@/lib/utils';

interface AdminPageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: boolean;
}

/**
 * Wraps every admin/employee page inside the DashboardShell.
 * Provides consistent vertical spacing (24px–28px between sections)
 * and bottom padding so the last element doesn't sit at the viewport edge.
 */
export function AdminPageContainer({ children, className, maxWidth }: AdminPageContainerProps) {
  return (
    <div
      className={cn(
        'w-full min-w-0 flex flex-col gap-6 pb-12',
        maxWidth && 'max-w-5xl',
        className
      )}
      style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}
    >
      {children}
    </div>
  );
}
