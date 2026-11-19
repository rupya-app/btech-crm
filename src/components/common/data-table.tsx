import React from 'react';
import { cn } from '@/lib/utils';

interface DataTableProps {
  headers: {
    label: string;
    className?: string;
    align?: 'left' | 'center' | 'right';
  }[];
  children: React.ReactNode;
  className?: string;
  emptyState?: React.ReactNode;
  isEmpty?: boolean;
}

export function DataTable({
  headers,
  children,
  className,
  emptyState,
  isEmpty,
}: DataTableProps) {
  return (
    <div className={cn('rounded-2xl border border-border bg-white overflow-hidden shadow-xs', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFB] border-b border-border" style={{ height: '48px' }}>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={cn(
                    'text-[12px] font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap',
                    h.align === 'center' && 'text-center',
                    h.align === 'right' && 'text-right',
                    h.className
                  )}
                  style={{ padding: '12px 18px', height: '48px' }}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {isEmpty ? (
              <tr>
                <td colSpan={headers.length} className="text-center" style={{ padding: '56px 24px' }}>
                  {emptyState || (
                    <div className="text-sm text-text-muted">No data available</div>
                  )}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface DataTableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function DataTableRow({ children, className, onClick }: DataTableRowProps) {
  return (
    <tr
      className={cn(
        'hover:bg-[#F8FAFB] transition-colors cursor-default',
        onClick && 'cursor-pointer',
        className
      )}
      style={{ height: '66px' }}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface DataTableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function DataTableCell({ children, className, align }: DataTableCellProps) {
  return (
    <td
      className={cn(
        'text-[13.5px]',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className
      )}
      style={{ padding: '14px 18px' }}
    >
      {children}
    </td>
  );
}
