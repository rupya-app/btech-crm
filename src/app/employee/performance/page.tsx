import React from 'react';
import { AdminPageContainer, PageHeader, PageCard } from '@/components/common';
import { getEmployeePersonalKPIs } from '@/services/analytics.service';
import { formatPercentage } from '@/lib/utils';

export default async function EmployeePerformancePage() {
  const stats = await getEmployeePersonalKPIs('emp-current');

  return (
    <AdminPageContainer>
      <PageHeader
        title="My Sales Performance & Targets"
        description="Review your personal conversion ratios, telecalling output, and follow-up efficiency."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <PageCard>
          <span className="text-[13px] font-medium text-text-secondary">My Conversion Rate</span>
          <div className="mt-2 text-3xl sm:text-4xl font-bold text-success tabular-nums">
            {formatPercentage(stats.conversionRate)}
          </div>
          <span className="text-[13px] text-text-muted mt-1.5 block">
            {stats.confirmedLeads} confirmed deals / {stats.myAssignedLeads} assigned leads
          </span>
        </PageCard>

        <PageCard>
          <span className="text-[13px] font-medium text-text-secondary">Pipeline Contact Rate</span>
          <div className="mt-2 text-3xl sm:text-4xl font-bold text-primary-700 tabular-nums">
            {formatPercentage(stats.contactRate)}
          </div>
          <span className="text-[13px] text-text-muted mt-1.5 block">
            {stats.contactedLeads} out of {stats.myAssignedLeads} leads engaged
          </span>
        </PageCard>

        <PageCard>
          <span className="text-[13px] font-medium text-text-secondary">Daily Call Target (20)</span>
          <div className="mt-2 text-3xl sm:text-4xl font-bold text-accent-blue tabular-nums">
            {stats.callsToday} / 20
          </div>
          <span className="text-[13px] text-text-muted mt-1.5 block">
            70% completed today
          </span>
        </PageCard>
      </div>
    </AdminPageContainer>
  );
}
