import React from 'react';
import Link from 'next/link';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Phone,
  TrendingUp,
  AlertCircle,
  Flame,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import { AdminPageContainer, PageCard } from '@/components/common';
import { KPICard } from '@/components/dashboard/kpi-card';
import { UpcomingFollowups } from '@/components/dashboard/upcoming-followups';
import { getEmployeePersonalKPIs } from '@/services/analytics.service';
import { getCurrentUserId } from '@/services/leads.service';
import { Button } from '@/components/ui/button';
import { formatNumber, formatPercentage } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function EmployeeDashboardPage() {
  const employeeId = await getCurrentUserId();
  const stats = await getEmployeePersonalKPIs(employeeId || undefined);

  const stageProgress = [
    { label: 'New', count: stats.myAssignedLeads - stats.contactedLeads, color: '#0EA5E9' },
    { label: 'Contacted', count: stats.contactedLeads, color: '#3B82F6' },
    { label: 'Interested', count: stats.interestedLeads, color: '#14B8A6' },
    { label: 'Pending', count: stats.pendingLeads, color: '#F59E0B' },
    { label: 'Confirmed', count: stats.confirmedLeads, color: '#10B981' },
  ];

  return (
    <AdminPageContainer>
      {/* Top Greeting Banner */}
      <div
        className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-primary-800 to-primary-600 rounded-2xl text-white shadow-md relative overflow-hidden"
        style={{ padding: '28px 32px', gap: '24px' }}
      >
        <div className="z-10">
          <div
            className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-primary-100 border border-white/15"
            style={{ padding: '5px 14px', gap: '8px', marginBottom: '14px' }}
          >
            <Flame className="w-3.5 h-3.5 text-warning" />
            <span>Personal Sales Workspace • Target: 20 Calls / Day</span>
          </div>
          <h1 className="text-[28px] leading-[1.2] font-bold tracking-tight">
            Sales Command Center
          </h1>
          <p
            className="text-[14px] text-primary-100/90 max-w-xl leading-relaxed"
            style={{ marginTop: '8px' }}
          >
            You have{' '}
            <strong className="text-white font-semibold">
              {stats.followUpsDue} follow-up calls due
            </strong>{' '}
            today and{' '}
            <strong className="text-white font-semibold">
              {formatNumber(stats.myAssignedLeads)} active leads
            </strong>{' '}
            in your assigned telecalling queue.
          </p>
        </div>

        <div className="flex items-center z-10 shrink-0 flex-wrap" style={{ gap: '12px' }}>
          <Button
            asChild
            variant="outline"
            className="bg-white/10 hover:bg-white/20 border-white/25 text-white hover:text-white text-[13px] font-semibold h-11 rounded-xl"
            style={{ padding: '0 18px', height: '42px' }}
          >
            <Link href="/employee/performance" className="flex items-center" style={{ gap: '8px' }}>
              <BarChart3 className="w-4 h-4" />
              <span>My Performance</span>
            </Link>
          </Button>

          <Button
            asChild
            className="bg-white text-primary-800 hover:bg-white/95 text-[13px] font-bold h-11 rounded-xl shadow-xs"
            style={{ padding: '0 18px', height: '42px' }}
          >
            <Link href="/employee/my-leads" className="flex items-center" style={{ gap: '8px' }}>
              <Phone className="w-4 h-4" />
              <span>Start Calling</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Row 1: Core KPIs */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        style={{ gap: '20px' }}
      >
        <KPICard
          label="My Assigned Leads"
          stageTag="Active Queue"
          value={stats.myAssignedLeads}
          icon={Briefcase}
          accentColor="#147D72"
          subtitle="Assigned to your queue"
          href="/employee/my-leads"
        />
        <KPICard
          label="Confirmed Won Deals"
          stageTag="Won Milestone"
          value={stats.confirmedLeads}
          icon={CheckCircle2}
          accentColor="#10B981"
          subtitle="Closed client orders"
          href="/employee/confirmed"
        />
        <KPICard
          label="Calls Made Today"
          stageTag="Daily Target"
          value={stats.callsToday}
          icon={Phone}
          accentColor="#0EA5E9"
          subtitle={`${stats.callsToday} / 20 Target`}
          href="/employee/call-history"
        />
        <KPICard
          label="Follow-ups Due Today"
          stageTag="Callback Queue"
          value={stats.followUpsDue}
          icon={Clock}
          accentColor="#8B5CF6"
          subtitle="Scheduled client callbacks"
          href="/employee/follow-ups"
        />
      </div>

      {/* Row 2: Secondary Conversion KPIs */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        style={{ gap: '20px' }}
      >
        <KPICard
          label="Interested Prospects"
          stageTag="High Intent"
          value={stats.interestedLeads}
          icon={TrendingUp}
          accentColor="#14B8A6"
          subtitle="Evaluating proposals"
          href="/employee/my-leads?status=interested"
        />
        <KPICard
          label="Pending Decisions"
          stageTag="Commercial Review"
          value={stats.pendingLeads}
          icon={AlertCircle}
          accentColor="#F59E0B"
          subtitle="In client decision phase"
          href="/employee/my-leads?status=pending"
        />
        <PageCard
          className="flex flex-col justify-between min-h-[164px]"
          style={{ borderTop: '3.5px solid #10B981' }}
        >
          <span className="text-[13px] font-semibold text-text-secondary">My Conversion Rate</span>
          <div className="my-3 flex items-baseline" style={{ gap: '10px', margin: '14px 0' }}>
            <span className="text-[32px] font-bold text-success tabular-nums leading-none">
              {stats.conversionRate}%
            </span>
            <span
              className="text-xs font-bold text-success bg-success-bg rounded-full border border-success/30"
              style={{ padding: '2px 10px' }}
            >
              Won
            </span>
          </div>
          <div
            className="border-t border-border-light text-[12px] text-text-muted"
            style={{ paddingTop: '12px' }}
          >
            {stats.confirmedLeads} won / {stats.myAssignedLeads} assigned
          </div>
        </PageCard>

        <PageCard
          className="flex flex-col justify-between min-h-[164px]"
          style={{ borderTop: '3.5px solid #3B82F6' }}
        >
          <span className="text-[13px] font-semibold text-text-secondary">Pipeline Contact Rate</span>
          <div className="my-3 flex items-baseline" style={{ gap: '10px', margin: '14px 0' }}>
            <span className="text-[32px] font-bold text-[#1D4ED8] tabular-nums leading-none">
              {stats.contactRate}%
            </span>
            <span
              className="text-xs font-bold text-[#1D4ED8] bg-[#DBEAFE] rounded-full border border-[#93C5FD]"
              style={{ padding: '2px 10px' }}
            >
              Engaged
            </span>
          </div>
          <div
            className="border-t border-border-light text-[12px] text-text-muted"
            style={{ paddingTop: '12px' }}
          >
            {stats.contactedLeads} contacted leads
          </div>
        </PageCard>
      </div>

      {/* Row 3: Pipeline Stage Distribution Banner for My Leads */}
      <div
        className="rounded-2xl bg-white border border-[#E7EAEE] shadow-xs"
        style={{ padding: '24px 28px' }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
          <div>
            <h3 className="text-[16px] font-bold text-text-primary">
              My Assigned Pipeline Stage Breakdown
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Live progression of your {formatNumber(stats.myAssignedLeads)} assigned leads
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/employee/my-leads">
              <span>View All Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </div>

        {/* Multi-segmented color progress bar */}
        <div
          className="w-full rounded-full bg-[#F4F6F9] overflow-hidden flex border border-[#E7EAEE]"
          style={{ height: '14px', gap: '3px', padding: '2px', marginBottom: '20px' }}
        >
          {stageProgress.map((s) => {
            if (s.count <= 0) return null;
            const pct = Math.max(4, Math.round((s.count / (stats.myAssignedLeads || 1)) * 100));
            return (
              <div
                key={s.label}
                style={{ width: `${pct}%`, backgroundColor: s.color }}
                className="h-full rounded-full transition-all duration-300"
                title={`${s.label}: ${s.count} (${pct}%)`}
              />
            );
          })}
        </div>

        {/* Stage Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5" style={{ gap: '12px' }}>
          {stageProgress.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-[#E7EAEE] bg-[#F8FAFB] flex items-center justify-between"
              style={{ padding: '10px 14px' }}
            >
              <span className="flex items-center text-xs font-semibold text-text-secondary" style={{ gap: '6px' }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span>{s.label}</span>
              </span>
              <span className="text-xs font-bold text-text-primary tabular-nums">
                {s.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 4: Follow-up Queue Component */}
      <UpcomingFollowups isAdmin={false} />
    </AdminPageContainer>
  );
}
