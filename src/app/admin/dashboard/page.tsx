import React from 'react';
import Link from 'next/link';
import {
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  Phone,
  Layers,
  TrendingUp,
  AlertCircle,
  Upload,
  UserPlus,
  Calendar,
} from 'lucide-react';
import { KPICard } from '@/components/dashboard/kpi-card';
import { LeadPipelineChart } from '@/components/dashboard/lead-pipeline-chart';
import { EmployeeLeaderboard } from '@/components/dashboard/employee-leaderboard';
import { RecentActivityFeed } from '@/components/dashboard/recent-activity-feed';
import { UpcomingFollowups } from '@/components/dashboard/upcoming-followups';
import { getAdminKPIs, getPipelineDistribution, getEmployeeRankings } from '@/services/analytics.service';
import { Button } from '@/components/ui/button';
import { AdminPageContainer } from '@/components/common/admin-page-container';

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const range = params?.range || '30d';

  const [kpis, pipelineStages, rankings] = await Promise.all([
    getAdminKPIs(),
    getPipelineDistribution(),
    getEmployeeRankings(),
  ]);

  return (
    <AdminPageContainer>
      {/* Top Banner / Welcome Row */}
      <div
        className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 rounded-2xl text-white shadow-md relative overflow-hidden"
        style={{ padding: '28px 32px', gap: '24px' }}
      >
        <div className="absolute right-0 top-0 w-80 h-80 bg-primary-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="z-10">
          <div
            className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-md text-[12.5px] font-semibold text-primary-100 border border-white/15"
            style={{ padding: '5px 14px', gap: '8px', marginBottom: '14px' }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Digital Sales CRM • Executive Command Center</span>
          </div>
          <h1 className="text-[28px] sm:text-[30px] font-bold tracking-tight leading-tight">
            Good day, Administrator
          </h1>
          <p
            className="text-[14px] text-primary-100/90 max-w-xl leading-relaxed"
            style={{ marginTop: '8px' }}
          >
            You have{' '}
            <strong className="text-white font-semibold">
              {kpis.followUpsDueToday} follow-ups due today
            </strong>{' '}
            and{' '}
            <strong className="text-white font-semibold">
              {kpis.unassignedLeads} unassigned leads
            </strong>{' '}
            ready for distribution.
          </p>
        </div>

        <div className="flex items-center z-10 shrink-0 flex-wrap" style={{ gap: '12px' }}>
          <Button
            asChild
            variant="outline"
            className="bg-white/10 hover:bg-white/20 border-white/25 text-white hover:text-white text-[13px] font-semibold h-11 rounded-xl"
            style={{ padding: '0 18px', height: '42px' }}
          >
            <Link href="/admin/assignments" className="flex items-center" style={{ gap: '8px' }}>
              <UserPlus className="w-4 h-4" />
              <span>Distribute Leads</span>
            </Link>
          </Button>

          <Button
            asChild
            className="bg-white text-primary-900 hover:bg-white/95 text-[13px] font-bold h-11 rounded-xl shadow-xs"
            style={{ padding: '0 18px', height: '42px' }}
          >
            <Link href="/admin/imports" className="flex items-center" style={{ gap: '8px' }}>
              <Upload className="w-4 h-4" />
              <span>Import Excel / CSV</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between overflow-x-auto"
        style={{ gap: '16px' }}
      >
        <div
          className="flex items-center bg-white rounded-2xl border border-border shadow-xs self-start"
          style={{ padding: '6px', gap: '6px' }}
        >
          {[
            { id: 'today', label: 'Today' },
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' },
            { id: 'month', label: 'This Month' },
          ].map((tab) => {
            const isActive = range === tab.id;
            return (
              <Link
                key={tab.id}
                href={`/admin/dashboard?range=${tab.id}`}
                className="rounded-xl text-[13px] transition-all whitespace-nowrap"
                style={{
                  padding: '8px 16px',
                  backgroundColor: isActive ? '#E8F3F1' : 'transparent',
                  color: isActive ? '#0E5F58' : '#68717D',
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <div
          className="hidden sm:flex items-center text-[13px] text-text-muted bg-white rounded-xl border border-border"
          style={{ padding: '8px 14px', gap: '8px' }}
        >
          <Calendar className="w-4 h-4 text-primary-600" />
          <span>Operational Timezone: Asia/Kolkata (IST)</span>
        </div>
      </div>

      {/* Primary 4 Stage-Colored KPI Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        style={{ gap: '20px' }}
      >
        <KPICard
          label="Total Pipeline Leads"
          stageTag="All Stages"
          value={kpis.totalLeads}
          icon={Briefcase}
          accentColor="#147D72"
          trend={{ value: 12.4, isPositive: true }}
          href="/admin/leads"
        />
        <KPICard
          label="Confirmed Won Deals"
          stageTag="Won Stage"
          value={kpis.confirmedLeads}
          icon={CheckCircle2}
          accentColor="#10B981"
          trend={{ value: 18.2, isPositive: true }}
          href="/admin/leads?status=confirmed"
        />
        <KPICard
          label="Unassigned Lead Pool"
          stageTag="Pool Queue"
          value={kpis.unassignedLeads}
          icon={Layers}
          accentColor="#6366F1"
          subtitle="Ready for self-claim or allocation"
          href="/admin/leads?status=unassigned"
        />
        <KPICard
          label="Follow-ups Due Today"
          stageTag="Action Needed"
          value={kpis.followUpsDueToday}
          icon={Clock}
          accentColor="#8B5CF6"
          subtitle={
            kpis.overdueFollowUps > 0
              ? `${kpis.overdueFollowUps} overdue tasks`
              : 'All tasks on schedule'
          }
          href="/admin/follow-ups"
        />
      </div>

      {/* Secondary 4 Stage-Colored KPI Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        style={{ gap: '20px' }}
      >
        <KPICard
          label="Interested Prospects"
          stageTag="High Intent"
          value={kpis.interestedLeads}
          icon={TrendingUp}
          accentColor="#0D9488"
          subtitle="Active product evaluations"
          href="/admin/leads?status=interested"
        />
        <KPICard
          label="Contacted Leads"
          stageTag="Outreach Active"
          value={kpis.contactedLeads}
          icon={Phone}
          accentColor="#3B82F6"
          subtitle="First call or message completed"
          href="/admin/leads?status=contacted"
        />
        <KPICard
          label="Pending Decisions"
          stageTag="Awaiting Client"
          value={kpis.pendingLeads}
          icon={AlertCircle}
          accentColor="#F59E0B"
          subtitle="In commercial or budget review"
          href="/admin/leads?status=pending"
        />
        <KPICard
          label="Active Sales Team"
          stageTag="Representatives"
          value={kpis.totalEmployees}
          icon={Users}
          accentColor="#0284C7"
          subtitle=" handling active queues"
          href="/admin/employees"
        />
      </div>

      {/* Visual Color-Coded Pipeline Bar */}
      <LeadPipelineChart stages={pipelineStages} totalLeads={kpis.totalLeads} />

      {/* Two Column Layout: Team Leaderboard & Live Activities */}
      <div
        className="grid grid-cols-1 lg:grid-cols-3"
        style={{ gap: '24px' }}
      >
        <div
          className="lg:col-span-2 flex flex-col"
          style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          <EmployeeLeaderboard rankings={rankings} />
          <UpcomingFollowups isAdmin={true} />
        </div>
        <div className="flex flex-col" style={{ gap: '24px' }}>
          <RecentActivityFeed />
        </div>
      </div>
    </AdminPageContainer>
  );
}
