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
  PlusCircle,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { KPICard } from '@/components/dashboard/kpi-card';
import { UpcomingFollowups } from '@/components/dashboard/upcoming-followups';
import { getEmployeePersonalKPIs } from '@/services/analytics.service';
import { Button } from '@/components/ui/button';


export default async function EmployeeDashboardPage() {
  const stats = await getEmployeePersonalKPIs('emp-current');

  return (
    <div className="space-y-6">
      {/* Top Greeting Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary-800 to-primary-600 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-primary-100 mb-3 border border-white/10">
            <Flame className="w-3.5 h-3.5 text-warning" />
            <span>Sales Workspace • Daily Target: 20 Calls</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back!
          </h1>
          <p className="text-xs sm:text-sm text-primary-100/90 mt-1">
            You have <strong className="text-white font-semibold">{stats.followUpsDue} follow-up calls due</strong> today and{' '}
            <strong className="text-white font-semibold">{stats.availablePoolLeads} leads</strong> available in the self-selection pool.
          </p>
        </div>

        <div className="flex items-center gap-2.5 z-10 shrink-0">
          <Button
            asChild
            variant="outline"
            className="bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-white text-xs h-9"
          >
            <Link href="/employee/lead-pool" className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Claim New Leads</span>
            </Link>
          </Button>

          <Button
            asChild
            className="bg-white text-primary-800 hover:bg-white/90 text-xs font-semibold h-9 shadow-sm"
          >
            <Link href="/employee/my-leads" className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span>Start Calling</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="My Assigned Leads"
          value={stats.myAssignedLeads}
          icon={Briefcase}
          iconBg="bg-primary-50"
          iconColor="text-primary-600"
          subtitle="Actively in your pipeline"
          href="/employee/my-leads"
        />
        <KPICard
          label="Confirmed Deals"
          value={stats.confirmedLeads}
          icon={CheckCircle2}
          iconBg="bg-success-bg"
          iconColor="text-success"
          trend={{ value: 25.0, isPositive: true, period: 'this month' }}
          href="/employee/confirmed"
        />
        <KPICard
          label="Available Pool Leads"
          value={stats.availablePoolLeads}
          icon={Layers}
          iconBg="bg-accent-blueSoft"
          iconColor="text-accent-blue"
          subtitle="Ready to self-claim"
          href="/employee/lead-pool"
        />
        <KPICard
          label="Follow-ups Due Today"
          value={stats.followUpsDue}
          icon={Clock}
          iconBg="bg-warning-bg"
          iconColor="text-warning"
          subtitle="Action required today"
          href="/employee/follow-ups"
        />
      </div>

      {/* Second Row KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard
          label="Calls Made Today"
          value={stats.callsToday}
          icon={Phone}
          iconBg="bg-primary-50"
          iconColor="text-primary-600"
          href="/employee/call-history"
        />
        <KPICard
          label="Interested Prospects"
          value={stats.interestedLeads}
          icon={TrendingUp}
          iconBg="bg-primary-50"
          iconColor="text-primary-600"
          href="/employee/my-leads?status=interested"
        />
        <KPICard
          label="Pending Responses"
          value={stats.pendingLeads}
          icon={AlertCircle}
          iconBg="bg-warning-bg"
          iconColor="text-warning"
          href="/employee/my-leads?status=pending"
        />
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-text-secondary">My Conversion Rate</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-text-primary tabular-nums">
              {stats.conversionRate}%
            </span>
            <span className="text-[11px] font-medium text-success bg-success-bg px-1.5 py-0.5 rounded">
              High
            </span>
          </div>
          <span className="text-[11px] text-text-muted mt-2">
            Contact rate: {stats.contactRate}%
          </span>
        </div>
      </div>

      {/* Upcoming Followups for Employee */}
      <UpcomingFollowups isAdmin={false} />
    </div>
  );
}
