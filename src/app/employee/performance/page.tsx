import React from 'react';
import { AdminPageContainer, PageHeader } from '@/components/common';
import { getEmployeePerformanceAnalytics } from '@/services/analytics.service';
import { getCurrentUserId } from '@/services/leads.service';
import { PerformanceCharts } from '@/components/dashboard/performance-charts';
import { BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EmployeePerformancePage() {
  const employeeId = await getCurrentUserId();
  const perf = await getEmployeePerformanceAnalytics(employeeId || undefined);

  if (!perf) {
    return (
      <AdminPageContainer>
        <PageHeader
          title="My Sales Performance & Activity Trends"
          description="Detailed analytical breakdown of your telecalling productivity, conversion ratios, and stage progression."
        />
        <div className="p-12 text-center text-sm text-text-muted">
          No performance analytics available yet.
        </div>
      </AdminPageContainer>
    );
  }

  return (
    <AdminPageContainer>
      <PageHeader
        title="My Sales Performance & Activity Trends"
        badge={
          <span
            className="inline-flex items-center rounded-full text-xs font-bold tracking-wide"
            style={{
              padding: '4px 12px',
              gap: '6px',
              backgroundColor: '#E0F2FE',
              color: '#0369A1',
              border: '1px solid #7DD3FC',
            }}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#0EA5E9]" />
            <span>Interactive Productivity Analytics</span>
          </span>
        }
        description="Comprehensive daily, weekly, and monthly activity metrics, telecalling volume, conversion rates, and stage progression."
      />

      <PerformanceCharts
        dailyData={perf.dailyData}
        weeklyData={perf.weeklyData}
        monthlyData={perf.monthlyData}
        stageDistribution={perf.stageDistribution}
        outcomeBreakdown={perf.outcomeBreakdown}
        kpis={perf.kpis}
      />
    </AdminPageContainer>
  );
}
