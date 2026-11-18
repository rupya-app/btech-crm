import React from 'react';
import Link from 'next/link';
import {
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  Phone,
  Layers,
  Star,
  Target,
  AlertCircle,
  Upload,
  UserPlus,
  TrendingUp,
  FileSpreadsheet,
  Calendar,
} from 'lucide-react';
import { KPICard } from '@/components/dashboard/kpi-card';
import { LeadPipelineChart } from '@/components/dashboard/lead-pipeline-chart';
import { EmployeeLeaderboard } from '@/components/dashboard/employee-leaderboard';
import { RecentActivityFeed } from '@/components/dashboard/recent-activity-feed';
import { UpcomingFollowups } from '@/components/dashboard/upcoming-followups';
import { getAdminKPIs, getPipelineDistribution, getEmployeeRankings } from '@/services/analytics.service';
import { Button } from '@/components/ui/button';


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
    <div className="space-y-6">
      {/* Top Banner / Welcome Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-primary-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-primary-100 mb-3 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-primary-300 animate-pulse" />
            <span>Digital Sales CRM • Executive Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Good day, Administrator
          </h1>
          <p className="text-xs sm:text-sm text-primary-100/80 mt-1 max-w-xl">
            You have <strong className="text-white font-semibold">{kpis.followUpsDueToday} follow-ups due today</strong> and{' '}
            <strong className="text-white font-semibold">{kpis.unassignedLeads} unassigned leads</strong> ready for distribution.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 z-10 shrink-0">
          <Button
            asChild
            variant="outline"
            className="bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-white text-xs h-9"
          >
            <Link href="/admin/assignments" className="flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5" />
              <span>Assign Leads</span>
            </Link>
          </Button>

          <Button
            asChild
            className="bg-white text-primary-900 hover:bg-white/90 text-xs font-semibold h-9 shadow-sm"
          >
            <Link href="/admin/imports" className="flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              <span>Import Excel / CSV</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border shadow-2xs">
          <Link
            href="/admin/dashboard?range=today"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              range === 'today'
                ? 'bg-primary-50 text-primary-700 font-semibold shadow-2xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Today
          </Link>
          <Link
            href="/admin/dashboard?range=7d"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              range === '7d'
                ? 'bg-primary-50 text-primary-700 font-semibold shadow-2xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Last 7 Days
          </Link>
          <Link
            href="/admin/dashboard?range=30d"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              range === '30d'
                ? 'bg-primary-50 text-primary-700 font-semibold shadow-2xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Last 30 Days
          </Link>
          <Link
            href="/admin/dashboard?range=month"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              range === 'month'
                ? 'bg-primary-50 text-primary-700 font-semibold shadow-2xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            This Month
          </Link>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-text-muted">
          <Calendar className="w-3.5 h-3.5" />
          <span>Default Timezone: Asia/Kolkata (IST)</span>
        </div>
      </div>

      {/* Primary 4 KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Database Leads"
          value={kpis.totalLeads}
          icon={Briefcase}
          iconBg="bg-primary-50"
          iconColor="text-primary-600"
          trend={{ value: 12.4, isPositive: true }}
          href="/admin/leads"
        />
        <KPICard
          label="Confirmed Deals"
          value={kpis.confirmedLeads}
          icon={CheckCircle2}
          iconBg="bg-success-bg"
          iconColor="text-success"
          trend={{ value: 18.2, isPositive: true }}
          href="/admin/leads?status=confirmed"
        />
        <KPICard
          label="Unassigned Pool"
          value={kpis.unassignedLeads}
          icon={Layers}
          iconBg="bg-accent-blueSoft"
          iconColor="text-accent-blue"
          subtitle="Ready for self-claim or allocation"
          href="/admin/assignments"
        />
        <KPICard
          label="Follow-ups Due Today"
          value={kpis.followUpsDueToday}
          icon={Clock}
          iconBg="bg-warning-bg"
          iconColor="text-warning"
          subtitle={kpis.overdueFollowUps > 0 ? `${kpis.overdueFollowUps} overdue tasks` : 'All tasks on schedule'}
          href="/admin/follow-ups"
        />
      </div>

      {/* Secondary 4 KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard
          label="Interested Prospects"
          value={kpis.interestedLeads}
          icon={TrendingUp}
          iconBg="bg-primary-50"
          iconColor="text-primary-600"
          href="/admin/leads?status=interested"
        />
        <KPICard
          label="Contacted Leads"
          value={kpis.contactedLeads}
          icon={Phone}
          iconBg="bg-accent-blueSoft"
          iconColor="text-accent-blue"
          href="/admin/leads?status=contacted"
        />
        <KPICard
          label="Pending Clarifications"
          value={kpis.pendingLeads}
          icon={AlertCircle}
          iconBg="bg-warning-bg"
          iconColor="text-warning"
          href="/admin/leads?status=pending"
        />
        <KPICard
          label="Active Sales Team"
          value={kpis.totalEmployees}
          icon={Users}
          iconBg="bg-accent-purpleSoft"
          iconColor="text-accent-purple"
          href="/admin/employees"
        />
      </div>

      {/* Visual Pipeline Bar */}
      <LeadPipelineChart stages={pipelineStages} totalLeads={kpis.totalLeads} />

      {/* Two Column Layout: Team Leaderboard & Live Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <EmployeeLeaderboard rankings={rankings} />
          <UpcomingFollowups isAdmin={true} />
        </div>
        <div className="space-y-6">
          <RecentActivityFeed />
        </div>
      </div>
    </div>
  );
}
