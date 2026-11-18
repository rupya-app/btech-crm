import React from 'react';
import Link from 'next/link';
import { Trophy, ArrowUpRight, Phone, CheckCircle2 } from 'lucide-react';
import { EmployeePerformance } from '@/types';
import { getInitials, formatNumber, formatPercentage } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface EmployeeLeaderboardProps {
  rankings: EmployeePerformance[];
}

export function EmployeeLeaderboard({ rankings }: EmployeeLeaderboardProps) {
  return (
    <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-warning-bg text-warning">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Sales Team Performance</h3>
            <p className="text-[11px] text-text-muted">Ranked by lead confirmations & conversion efficiency</p>
          </div>
        </div>
        <Link
          href="/admin/analytics"
          className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          <span>Full Analytics</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border-light text-text-muted font-medium">
              <th className="pb-2.5 pl-1">Employee</th>
              <th className="pb-2.5 text-center">Assigned</th>
              <th className="pb-2.5 text-center">Contacted</th>
              <th className="pb-2.5 text-center">Confirmed</th>
              <th className="pb-2.5 text-right pr-1">Conversion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {rankings.map((r, idx) => (
              <tr key={r.employee.id} className="hover:bg-surface-muted/50 transition-colors">
                <td className="py-3 pl-1">
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 text-[11px] font-bold text-text-muted tabular-nums">
                      #{idx + 1}
                    </span>
                    <Avatar className="h-7 w-7 border border-border">
                      <AvatarFallback className="bg-primary-50 text-primary-700 text-[10px] font-bold">
                        {getInitials(r.employee.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <Link
                        href={`/admin/employees/${r.employee.id}`}
                        className="font-medium text-text-primary hover:text-primary-600 truncate"
                      >
                        {r.employee.full_name}
                      </Link>
                      <span className="text-[10px] text-text-muted">{r.employee.employee_id}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-center tabular-nums text-text-secondary font-medium">
                  {formatNumber(r.assignedLeads)}
                </td>
                <td className="py-3 text-center tabular-nums text-text-secondary">
                  {formatNumber(r.contactedLeads)}
                </td>
                <td className="py-3 text-center tabular-nums">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-bg text-success font-semibold text-[11px]">
                    <CheckCircle2 className="w-3 h-3" />
                    {r.confirmedLeads}
                  </span>
                </td>
                <td className="py-3 text-right pr-1 tabular-nums font-semibold text-text-primary">
                  {formatPercentage(r.conversionRate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
