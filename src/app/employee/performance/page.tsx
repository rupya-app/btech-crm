import React from 'react';
import {
  TrendingUp,
  Phone,
  CheckCircle2,
  Clock,
  Target,
  Award,
} from 'lucide-react';
import { getEmployeePersonalKPIs } from '@/services/analytics.service';
import { formatNumber, formatPercentage } from '@/lib/utils';

export default async function EmployeePerformancePage() {
  const stats = await getEmployeePersonalKPIs('emp-current');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          My Sales Performance & Targets
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Review your personal conversion ratios, telecalling output, and follow-up efficiency.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs">
          <span className="text-xs font-medium text-text-secondary">My Conversion Rate</span>
          <div className="mt-2 text-3xl font-bold text-success tabular-nums">
            {formatPercentage(stats.conversionRate)}
          </div>
          <span className="text-[11px] text-text-muted mt-1 block">
            {stats.confirmedLeads} confirmed deals / {stats.myAssignedLeads} assigned leads
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs">
          <span className="text-xs font-medium text-text-secondary">Pipeline Contact Rate</span>
          <div className="mt-2 text-3xl font-bold text-primary-700 tabular-nums">
            {formatPercentage(stats.contactRate)}
          </div>
          <span className="text-[11px] text-text-muted mt-1 block">
            {stats.contactedLeads} out of {stats.myAssignedLeads} leads engaged
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs">
          <span className="text-xs font-medium text-text-secondary">Daily Call Target (20)</span>
          <div className="mt-2 text-3xl font-bold text-accent-blue tabular-nums">
            {stats.callsToday} / 20
          </div>
          <span className="text-[11px] text-text-muted mt-1 block">
            70% completed today
          </span>
        </div>
      </div>
    </div>
  );
}
