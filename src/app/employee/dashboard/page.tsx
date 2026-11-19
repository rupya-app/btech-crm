import React from 'react';
import Link from 'next/link';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Phone,
  Layers,
  TrendingUp,
  AlertCircle,
  Flame,
} from 'lucide-react';
import { AdminPageContainer, PageCard } from '@/components/common';
import { KPICard } from '@/components/dashboard/kpi-card';
import { UpcomingFollowups } from '@/components/dashboard/upcoming-followups';
import { getEmployeePersonalKPIs } from '@/services/analytics.service';
import { Button } from '@/components/ui/button';

export default async function EmployeeDashboardPage() {
  const stats = await getEmployeePersonalKPIs('emp-current');

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
            <span>Sales Workspace • Daily Target: 20 Calls</span>
          </div>
          <h1 className="text-[28px] leading-[1.2] font-bold tracking-tight">
            Welcome back!
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
              {stats.availablePoolLeads} leads
            </strong>{' '}
            available in the self-selection pool.
          </p>
        </div>

        <div className="flex items-center z-10 shrink-0 flex-wrap" style={{ gap: '12px' }}>
          <Button
            asChild
            variant="outline"
            className="bg-white/10 hover:bg-white/20 border-white/25 text-white hover:text-white text-[13px] font-semibold h-11 rounded-xl"
            style={{ padding: '0 18px', height: '42px' }}
          >
            <Link href="/employee/lead-pool" className="flex items-center" style={{ gap: '8px' }}>
              <Layers className="w-4 h-4" />
              <span>Claim New Leads</span>
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

      {/* KPI Cards Grid */}
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
          subtitle="Actively in your pipeline"
          href="/employee/my-leads"
        />
        <KPICard
          label="Confirmed Won Deals"
          stageTag="Won Stage"
          value={stats.confirmedLeads}
          icon={CheckCircle2}
          accentColor="#10B981"
          trend={{ value: 25.0, isPositive: true, period: 'this month' }}
          href="/employee/confirmed"
        />
        <KPICard
          label="Unassigned Pool Leads"
          stageTag="Pool Queue"
          value={stats.availablePoolLeads}
          icon={Layers}
          accentColor="#6366F1"
          subtitle="Ready to self-claim"
          href="/employee/lead-pool"
        />
        <KPICard
          label="Follow-ups Due Today"
          stageTag="Action Needed"
          value={stats.followUpsDue}
          icon={Clock}
          accentColor="#8B5CF6"
          subtitle="Action required today"
          href="/employee/follow-ups"
        />
      </div>

      {/* Second Row KPIs */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        style={{ gap: '20px' }}
      >
        <KPICard
          label="Calls Made Today"
          stageTag="Outreach"
          value={stats.callsToday}
          icon={Phone}
          accentColor="#3B82F6"
          subtitle="Logged outbound attempts"
          href="/employee/call-history"
        />
        <KPICard
          label="Interested Prospects"
          stageTag="High Intent"
          value={stats.interestedLeads}
          icon={TrendingUp}
          accentColor="#0D9488"
          subtitle="Evaluating proposals"
          href="/employee/my-leads?status=interested"
        />
        <KPICard
          label="Pending Decisions"
          stageTag="Awaiting Client"
          value={stats.pendingLeads}
          icon={AlertCircle}
          accentColor="#F59E0B"
          subtitle="In commercial review"
          href="/employee/my-leads?status=pending"
        />
        <PageCard
          className="flex flex-col justify-between min-h-[164px]"
          style={{ borderTop: '3.5px solid #059669' }}
        >
          <span className="text-[13px] font-semibold text-text-secondary">My Conversion Rate</span>
          <div className="my-3 flex items-baseline" style={{ gap: '10px', margin: '14px 0' }}>
            <span className="text-[32px] font-bold text-text-primary tabular-nums leading-none">
              {stats.conversionRate}%
            </span>
            <span
              className="text-xs font-bold text-success bg-success-bg rounded-full border border-success/30"
              style={{ padding: '2px 10px' }}
            >
              High
            </span>
          </div>
          <div
            className="border-t border-border-light text-[12px] text-text-muted"
            style={{ paddingTop: '12px' }}
          >
            Contact rate: <strong className="text-text-primary">{stats.contactRate}%</strong>
          </div>
        </PageCard>
      </div>

      {/* Upcoming Followups for Employee */}
      <UpcomingFollowups isAdmin={false} />
    </AdminPageContainer>
  );
}
