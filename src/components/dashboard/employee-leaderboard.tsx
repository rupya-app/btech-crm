import React from 'react';
import Link from 'next/link';
import { Trophy, ArrowUpRight, CheckCircle2, ExternalLink } from 'lucide-react';
import { EmployeePerformance } from '@/types';
import { getInitials, formatNumber, formatPercentage } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PageCard, PageCardHeader, DataTable, DataTableRow, DataTableCell } from '@/components/common';

interface EmployeeLeaderboardProps {
  rankings: EmployeePerformance[];
}

export function EmployeeLeaderboard({ rankings }: EmployeeLeaderboardProps) {
  return (
    <PageCard>
      <PageCardHeader
        title="Sales Team Performance"
        description="Click any representative to inspect their daily activity log, call outcomes, markings, and remarks"
        icon={Trophy}
        actions={
          <Link
            href="/admin/employees"
            className="text-[13px] font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <span>Sales Team Directory</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        }
      />

      <DataTable
        headers={[
          { label: 'Sales Representative' },
          { label: 'Assigned', align: 'center' },
          { label: 'Contacted', align: 'center' },
          { label: 'Pending', align: 'center' },
          { label: 'Confirmed', align: 'center' },
          { label: 'Conversion', align: 'right' },
          { label: 'Daily Log', align: 'right' },
        ]}
        isEmpty={rankings.length === 0}
        emptyState={
          <span className="text-sm text-text-muted">
            No sales team members added yet.
          </span>
        }
      >
        {rankings.map((r, idx) => (
          <DataTableRow key={r.employee.id}>
            <DataTableCell>
              <div className="flex items-center gap-3">
                <span className="w-5 text-[12px] font-bold text-text-muted tabular-nums">
                  #{idx + 1}
                </span>
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="bg-primary-50 text-primary-700 text-xs font-bold">
                    {getInitials(r.employee.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <Link
                    href={`/admin/employees/${r.employee.id}`}
                    className="font-bold text-text-primary hover:text-primary-600 truncate text-[13.5px] flex items-center gap-1.5"
                  >
                    <span>{r.employee.full_name}</span>
                    <ExternalLink className="w-3 h-3 text-text-muted shrink-0" />
                  </Link>
                  <span className="text-[12px] text-text-muted">{r.employee.employee_id}</span>
                </div>
              </div>
            </DataTableCell>
            <DataTableCell align="center" className="tabular-nums text-text-primary font-bold">
              {formatNumber(r.assignedLeads)}
            </DataTableCell>
            <DataTableCell align="center" className="tabular-nums text-text-secondary font-medium">
              {formatNumber(r.contactedLeads)}
            </DataTableCell>
            <DataTableCell align="center" className="tabular-nums text-warning font-bold">
              {formatNumber(r.pendingLeads)}
            </DataTableCell>
            <DataTableCell align="center" className="tabular-nums">
              <span
                className="inline-flex items-center gap-1 rounded-full bg-success-bg text-success font-semibold text-xs"
                style={{ padding: '3px 10px' }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {r.confirmedLeads}
              </span>
            </DataTableCell>
            <DataTableCell align="right" className="tabular-nums font-bold text-text-primary">
              {formatPercentage(r.conversionRate)}
            </DataTableCell>
            <DataTableCell align="right">
              <Link
                href={`/admin/employees/${r.employee.id}`}
                className="inline-flex items-center rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-semibold border border-primary-200 transition-colors"
                style={{ padding: '5px 10px' }}
              >
                View Profile →
              </Link>
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTable>
    </PageCard>
  );
}
