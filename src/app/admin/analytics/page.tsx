import React from 'react';
import {
  BarChart3,
  Phone,
} from 'lucide-react';
import {
  AdminPageContainer,
  PageHeader,
  PageCard,
  PageCardHeader,
} from '@/components/common';
import {
  getAdminKPIs,
  getEmployeeRankings,
  getAnalyticsBreakdown,
} from '@/services/analytics.service';
import { EmployeeLeaderboard } from '@/components/dashboard/employee-leaderboard';
import { formatNumber, formatPercentage } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const [kpis, rankings, breakdown] = await Promise.all([
    getAdminKPIs(),
    getEmployeeRankings(),
    getAnalyticsBreakdown(),
  ]);

  const overallConversionRate =
    kpis.totalLeads > 0 ? Math.round((kpis.confirmedLeads / kpis.totalLeads) * 100) : 0;
  const overallContactRate =
    kpis.totalLeads > 0 ? Math.round((kpis.contactedLeads / kpis.totalLeads) * 100) : 0;

  return (
    <AdminPageContainer>
      <PageHeader
        title="Executive Sales Analytics & Performance"
        description="Formula-backed operational metrics, lead contact rates, conversion ratios, and team benchmarks computed from your database."
      />

      {/* Top 4 Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: '20px' }}>
        <PageCard style={{ borderTop: '3.5px solid #10B981' }}>
          <span className="text-[13px] font-semibold text-text-secondary">
            Overall Conversion Rate
          </span>
          <div className="mt-2 text-3xl font-bold text-success tabular-nums">
            {formatPercentage(overallConversionRate)}
          </div>
          <p className="text-[13px] text-text-muted mt-1.5">
            Confirmed Deals / Total Leads ({kpis.confirmedLeads}/{kpis.totalLeads})
          </p>
        </PageCard>

        <PageCard style={{ borderTop: '3.5px solid #147D72' }}>
          <span className="text-[13px] font-semibold text-text-secondary">
            Unique Lead Contact Rate
          </span>
          <div className="mt-2 text-3xl font-bold text-primary-700 tabular-nums">
            {formatPercentage(overallContactRate)}
          </div>
          <p className="text-[13px] text-text-muted mt-1.5">
            {kpis.contactedLeads} unique businesses contacted
          </p>
        </PageCard>

        <PageCard style={{ borderTop: '3.5px solid #0EA5E9' }}>
          <span className="text-[13px] font-semibold text-text-secondary">
            Active Funnel Pipeline
          </span>
          <div className="mt-2 text-3xl font-bold text-text-primary tabular-nums">
            {formatNumber(kpis.interestedLeads + kpis.pendingLeads + kpis.followUpLeads)}
          </div>
          <p className="text-[13px] text-text-muted mt-1.5">
            Interested, Follow-up & Pending leads
          </p>
        </PageCard>

        <PageCard style={{ borderTop: '3.5px solid #6366F1' }}>
          <span className="text-[13px] font-semibold text-text-secondary">
            Unassigned Pool Queue
          </span>
          <div className="mt-2 text-3xl font-bold text-accent-blue tabular-nums">
            {formatNumber(kpis.unassignedLeads)}
          </div>
          <p className="text-[13px] text-text-muted mt-1.5">
            Leads awaiting distribution or claiming
          </p>
        </PageCard>
      </div>

      {/* Lead Source Breakdown & Conversion Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: '24px' }}>
        <PageCard>
          <PageCardHeader
            title="Acquisition Sources Performance"
            description="Live volume and conversion efficiency by lead source"
            icon={BarChart3}
          />

          {breakdown.sources.length === 0 ? (
            <p className="text-[13px] text-text-muted py-6 text-center">
              No lead sources recorded yet.
            </p>
          ) : (
            <div className="space-y-4">
              {breakdown.sources.map((src, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[13px] font-medium">
                    <span className="text-text-primary font-semibold">{src.source}</span>
                    <div className="flex gap-3 text-text-muted">
                      <span className="tabular-nums font-semibold text-text-primary">
                        {formatNumber(src.count)} leads
                      </span>
                      <span className="text-success font-bold">{src.rate} conv.</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-surface-muted rounded-full overflow-hidden border border-border">
                    <div
                      className={`h-full ${src.color} rounded-full`}
                      style={{ width: `${src.widthPct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </PageCard>

        <PageCard>
          <PageCardHeader
            title="Call Outcome Distribution"
            description={`Breakdown of ${breakdown.totalCalls} logged telecalling attempts`}
            icon={Phone}
          />

          {breakdown.callOutcomes.length === 0 ? (
            <p className="text-[13px] text-text-muted py-6 text-center">
              No call outcomes logged yet.
            </p>
          ) : (
            <div className="space-y-3 text-[13px]">
              {breakdown.callOutcomes.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl bg-[#F8FAFB] border border-border-light"
                  style={{ padding: '12px 16px' }}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-text-primary">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="tabular-nums text-text-secondary">
                      {formatNumber(item.count)} calls
                    </span>
                    <span className="text-[12px] font-bold text-text-primary tabular-nums">
                      ({item.pct}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PageCard>
      </div>

      {/* Sales Team Leaderboard */}
      <EmployeeLeaderboard rankings={rankings} />
    </AdminPageContainer>
  );
}
