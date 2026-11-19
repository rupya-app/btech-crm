'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  TrendingUp,
  MessageSquare,
  UserPlus,
  Activity,
  Tag,
  ArrowRight,
  Building2,
  ExternalLink,
} from 'lucide-react';
import {
  AdminPageContainer,
  PageCard,
  PageCardHeader,
  FilterTabs,
  DataTable,
  DataTableRow,
  DataTableCell,
  SuccessNotice,
} from '@/components/common';
import { KPICard } from '@/components/dashboard/kpi-card';
import { LeadStatusBadge } from '@/components/leads/lead-status-badge';
import { LeadPriorityBadge } from '@/components/leads/lead-priority-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getInitials,
  formatDate,
  formatDateTime,
  formatNumber,
  callOutcomeLabels,
} from '@/lib/utils';

export default function AdminEmployeeDetailPage() {
  const params = useParams();
  const employeeIdParam = String(params?.id || '');

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'daily' | 'calls' | 'markings' | 'remarks' | 'leads'
  >('daily');
  const [leadFilter, setLeadFilter] = useState<string>('all');

  // Direct Lead Assignment Modal State
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignQty, setAssignQty] = useState<string>('50');
  const [assigning, setAssigning] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchProfileDetail = useCallback(async () => {
    if (!employeeIdParam) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/employees/${employeeIdParam}`);
      const json = await res.json();
      if (res.ok && json.employee) {
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [employeeIdParam]);

  useEffect(() => {
    fetchProfileDetail();
  }, [fetchProfileDetail]);

  const handleAssignToEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.employee?.id) return;

    const isAll = assignQty === 'ALL';
    const numericQty = isAll ? data.unassignedPoolCount : parseInt(assignQty, 10);
    if (!isAll && (!numericQty || numericQty <= 0)) return;

    setAssigning(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/leads/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'single',
          employeeId: data.employee.id,
          count: numericQty,
          assignAll: isAll,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to allocate leads');

      setNotice(json.message);
      setIsAssignOpen(false);
      await fetchProfileDetail();
    } catch (err: any) {
      setErrorMsg(err.message || 'Allocation failed');
    } finally {
      setAssigning(false);
    }
  };

  if (loading && !data) {
    return (
      <AdminPageContainer>
        <PageCard className="text-center py-16">
          <p className="text-[14px] text-text-muted">
            Loading sales representative profile, daily activity log, and call metrics...
          </p>
        </PageCard>
      </AdminPageContainer>
    );
  }

  if (!data?.employee) {
    return (
      <AdminPageContainer>
        <div>
          <Link
            href="/admin/employees"
            className="inline-flex items-center rounded-xl bg-white border border-border text-[13px] font-semibold text-text-secondary hover:text-primary-700 transition-all shadow-xs"
            style={{ padding: '8px 16px', gap: '8px' }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sales Team Directory</span>
          </Link>
        </div>
        <PageCard className="text-center py-16">
          <p className="text-[16px] font-bold text-text-primary">Employee profile not found</p>
        </PageCard>
      </AdminPageContainer>
    );
  }

  const {
    employee,
    unassignedPoolCount = 0,
    stats,
    dailyHistory = [],
    calls = [],
    markings = [],
    remarks = [],
    assignedLeads = [],
  } = data;

  const filteredLeads = assignedLeads.filter((l: any) => {
    if (leadFilter === 'all') return true;
    if (leadFilter === 'pending_queue') {
      return l.status === 'pending' || l.status === 'follow_up' || l.status === 'new';
    }
    return l.status === leadFilter;
  });

  const stageItems = [
    { key: 'new', label: 'New Inquiries', color: '#0EA5E9', bg: '#E0F2FE', text: '#0369A1' },
    { key: 'contacted', label: 'Contacted', color: '#3B82F6', bg: '#DBEAFE', text: '#1D4ED8' },
    { key: 'interested', label: 'Interested', color: '#14B8A6', bg: '#CCFBF1', text: '#0F766E' },
    { key: 'follow_up', label: 'Follow-up Queue', color: '#8B5CF6', bg: '#F3E8FF', text: '#6D28D9' },
    { key: 'pending', label: 'Pending Decision', color: '#F59E0B', bg: '#FEF3C7', text: '#B45309' },
    { key: 'confirmed', label: 'Confirmed Won', color: '#10B981', bg: '#D1FAE5', text: '#047857' },
    { key: 'not_interested', label: 'Closed Lost', color: '#F43F5E', bg: '#FFE4E6', text: '#BE123C' },
    { key: 'unqualified', label: 'Disqualified', color: '#EF4444', bg: '#FEE2E2', text: '#B91C1C' },
  ];

  return (
    <AdminPageContainer>
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between flex-wrap" style={{ gap: '12px' }}>
        <Link
          href="/admin/employees"
          className="inline-flex items-center rounded-xl bg-white border border-border text-[13px] font-semibold text-text-secondary hover:text-primary-700 hover:border-primary-200 transition-all shadow-xs"
          style={{ padding: '8px 16px', gap: '8px' }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sales Team Directory</span>
        </Link>

        <span className="text-[12.5px] text-text-muted">
          Unassigned Pool Available:{' '}
          <strong className="text-primary-700 font-bold">{formatNumber(unassignedPoolCount)} leads</strong>
        </span>
      </div>

      {notice && <SuccessNotice message={notice} />}

      {/* Employee Profile Header Banner */}
      <PageCard
        className="flex flex-col lg:flex-row lg:items-center justify-between"
        style={{ gap: '24px', borderTop: '4px solid #147D72' }}
      >
        <div className="flex items-start sm:items-center flex-col sm:flex-row" style={{ gap: '20px' }}>
          <Avatar className="h-16 w-16 border-2 border-primary-200 shadow-xs">
            <AvatarFallback className="bg-primary-50 text-primary-700 text-xl font-bold">
              {getInitials(employee.full_name)}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center flex-wrap" style={{ gap: '10px', marginBottom: '6px' }}>
              <span
                className="text-xs font-mono font-bold text-primary-800 bg-primary-50 rounded-full border border-primary-200"
                style={{ padding: '3px 10px' }}
              >
                {employee.employee_id}
              </span>
              <span
                className="text-xs font-semibold rounded-full"
                style={{
                  padding: '3px 10px',
                  backgroundColor: employee.is_active ? '#D1FAE5' : '#FEE2E2',
                  color: employee.is_active ? '#065F46' : '#991B1B',
                }}
              >
                {employee.is_active ? 'Active Representative' : 'Deactivated'}
              </span>
              <span className="text-xs text-text-muted font-medium">
                {employee.department || 'Enterprise Sales'} • {employee.job_title || 'Sales Executive'}
              </span>
            </div>

            <h1 className="text-[26px] font-bold text-text-primary tracking-tight">
              {employee.full_name}
            </h1>

            <div
              className="flex flex-wrap items-center text-[13px] text-text-secondary"
              style={{ gap: '18px', marginTop: '8px' }}
            >
              <span className="flex items-center" style={{ gap: '6px' }}>
                <Mail className="w-3.5 h-3.5 text-text-muted" />
                {employee.email}
              </span>
              {employee.phone && (
                <span className="flex items-center tabular-nums" style={{ gap: '6px' }}>
                  <Phone className="w-3.5 h-3.5 text-text-muted" />
                  {employee.phone}
                </span>
              )}
              <span className="flex items-center text-text-muted" style={{ gap: '6px' }}>
                <Calendar className="w-3.5 h-3.5" />
                Joined {formatDate(employee.created_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap shrink-0" style={{ gap: '12px' }}>
          <Button onClick={() => setIsAssignOpen(true)}>
            <UserPlus className="w-4 h-4" />
            <span>Assign Leads to {employee.full_name.split(' ')[0]}</span>
          </Button>
        </div>
      </PageCard>

      {/* 8 KPI Cards Grid: Calls, Pending, Markings, Confirmed, Assigned */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: '18px' }}>
        <KPICard
          label="Total Assigned Leads"
          stageTag="Active Queue"
          value={stats.totalAssigned}
          icon={Briefcase}
          accentColor="#147D72"
          subtitle={`${stats.contactRate}% contacted (${stats.contactedLeads} leads)`}
        />
        <KPICard
          label="Total Calls Made"
          stageTag={`${stats.callsToday} Today`}
          value={stats.totalCalls}
          icon={Phone}
          accentColor="#3B82F6"
          subtitle={`${stats.callsToday} outbound calls logged today`}
        />
        <KPICard
          label="Pending & Follow-up Queue"
          stageTag="Action Pending"
          value={stats.pendingLeads}
          icon={Clock}
          accentColor="#F59E0B"
          subtitle={`${stats.stageBreakdown.pending} pending • ${stats.stageBreakdown.follow_up} follow-up • ${stats.stageBreakdown.new} untouched`}
        />
        <KPICard
          label="Confirmed Won Deals"
          stageTag={`${stats.conversionRate}% Conv.`}
          value={stats.confirmedLeads}
          icon={CheckCircle2}
          accentColor="#10B981"
          subtitle={`Conversion ratio: ${stats.conversionRate}%`}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: '18px' }}>
        <PageCard style={{ borderTop: '3.5px solid #14B8A6', padding: '18px 20px' }}>
          <span className="text-[12.5px] font-semibold text-text-secondary">Interested Prospects</span>
          <div className="text-[26px] font-bold text-text-primary tabular-nums mt-1">
            {formatNumber(stats.interestedLeads)}
          </div>
          <span className="text-[12px] text-text-muted">High-intent evaluations</span>
        </PageCard>

        <PageCard style={{ borderTop: '3.5px solid #8B5CF6', padding: '18px 20px' }}>
          <span className="text-[12.5px] font-semibold text-text-secondary">Remarks & Notes Logged</span>
          <div className="text-[26px] font-bold text-text-primary tabular-nums mt-1">
            {formatNumber(stats.totalRemarks)}
          </div>
          <span className="text-[12px] text-text-muted">Recorded client conversations</span>
        </PageCard>

        <PageCard style={{ borderTop: '3.5px solid #6366F1', padding: '18px 20px' }}>
          <span className="text-[12.5px] font-semibold text-text-secondary">Scheduled Callbacks</span>
          <div className="text-[26px] font-bold text-text-primary tabular-nums mt-1">
            {formatNumber(stats.followUpsScheduled)}
          </div>
          <span className="text-[12px] text-danger font-semibold">
            {stats.overdueFollowUps > 0 ? `${stats.overdueFollowUps} overdue` : '0 overdue'}
          </span>
        </PageCard>

        <PageCard style={{ borderTop: '3.5px solid #F43F5E', padding: '18px 20px' }}>
          <span className="text-[12.5px] font-semibold text-text-secondary">Closed Lost / Disqualified</span>
          <div className="text-[26px] font-bold text-text-primary tabular-nums mt-1">
            {formatNumber(stats.notInterestedLeads + stats.disqualifiedLeads)}
          </div>
          <span className="text-[12px] text-text-muted">
            {stats.notInterestedLeads} lost • {stats.disqualifiedLeads} disqualified
          </span>
        </PageCard>
      </div>

      {/* Stage Markings Breakdown Bar */}
      <PageCard>
        <PageCardHeader
          title="Representative's Lead Stage Markings Breakdown"
          description={`Current stage distribution across ${formatNumber(stats.totalAssigned)} assigned leads`}
          icon={Tag}
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8" style={{ gap: '12px' }}>
          {stageItems.map((st) => {
            const count = stats.stageBreakdown[st.key] || 0;
            return (
              <button
                key={st.key}
                type="button"
                onClick={() => {
                  setLeadFilter(st.key);
                  setActiveTab('leads');
                }}
                className="flex flex-col rounded-xl text-left transition-all hover:shadow-sm cursor-pointer"
                style={{
                  padding: '14px',
                  backgroundColor: st.bg,
                  border: `1px solid ${st.color}40`,
                  borderLeft: `4px solid ${st.color}`,
                }}
              >
                <span className="text-[11.5px] font-bold truncate" style={{ color: st.text }}>
                  {st.label}
                </span>
                <span className="text-[22px] font-bold text-text-primary tabular-nums mt-1">
                  {formatNumber(count)}
                </span>
              </button>
            );
          })}
        </div>
      </PageCard>

      {/* Navigation Tabs for Daily History, Calls, Markings, Remarks, Assigned Leads */}
      <FilterTabs
        tabs={[
          { id: 'daily', label: `Daily Work Log (${dailyHistory.length} Days)`, icon: Calendar },
          { id: 'calls', label: `Call History (${calls.length})`, icon: Phone },
          { id: 'markings', label: `Stage Markings (${markings.length})`, icon: Tag },
          { id: 'remarks', label: `Remarks & Notes (${remarks.length})`, icon: MessageSquare },
          { id: 'leads', label: `Assigned & Pending Leads (${assignedLeads.length})`, icon: Briefcase },
        ]}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as any)}
      />

      {/* TAB 1: DAILY WORK LOG ("what they have done every day") */}
      {activeTab === 'daily' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {dailyHistory.length === 0 ? (
            <PageCard className="text-center py-14">
              <Calendar className="w-10 h-10 text-text-muted/40 mx-auto mb-3" />
              <p className="text-[15px] font-bold text-text-primary">
                No daily activity recorded yet for {employee.full_name}
              </p>
              <p className="text-[13px] text-text-muted mt-1">
                As soon as leads are assigned or calls, remarks, and stage markings are logged, their day-by-day history will appear here.
              </p>
            </PageCard>
          ) : (
            dailyHistory.map((day: any) => (
              <PageCard key={day.dateKey}>
                <div
                  className="flex flex-col md:flex-row md:items-center justify-between border-b border-border-light"
                  style={{ paddingBottom: '16px', marginBottom: '18px', gap: '12px' }}
                >
                  <div className="flex items-center" style={{ gap: '12px' }}>
                    <div
                      className="rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center border border-primary-200 font-bold"
                      style={{ width: '40px', height: '40px' }}
                    >
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-text-primary">{day.dateLabel}</h3>
                      <p className="text-[12.5px] text-text-muted">
                        {day.events.length} total CRM actions recorded on this day
                      </p>
                    </div>
                  </div>

                  {/* Daily Metrics Summary Pills */}
                  <div className="flex items-center flex-wrap" style={{ gap: '8px' }}>
                    <span
                      className="rounded-full text-xs font-bold"
                      style={{
                        padding: '4px 12px',
                        backgroundColor: '#DBEAFE',
                        color: '#1E40AF',
                      }}
                    >
                      {day.callsCount} Calls Made
                    </span>
                    <span
                      className="rounded-full text-xs font-bold"
                      style={{
                        padding: '4px 12px',
                        backgroundColor: '#CCFBF1',
                        color: '#115E59',
                      }}
                    >
                      {day.markingsCount} Stage Markings
                    </span>
                    <span
                      className="rounded-full text-xs font-bold"
                      style={{
                        padding: '4px 12px',
                        backgroundColor: '#F3E8FF',
                        color: '#5B21B6',
                      }}
                    >
                      {day.remarksCount} Remarks
                    </span>
                    {day.confirmedCount > 0 && (
                      <span
                        className="rounded-full text-xs font-bold"
                        style={{
                          padding: '4px 12px',
                          backgroundColor: '#D1FAE5',
                          color: '#065F46',
                        }}
                      >
                        {day.confirmedCount} Confirmed Won
                      </span>
                    )}
                    {day.assignedCount > 0 && (
                      <span
                        className="rounded-full text-xs font-bold"
                        style={{
                          padding: '4px 12px',
                          backgroundColor: '#EEF2FF',
                          color: '#3730A3',
                        }}
                      >
                        {day.assignedCount} Assigned
                      </span>
                    )}
                  </div>
                </div>

                {/* Chronological Events for This Day */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {day.events.map((ev: any) => (
                    <div
                      key={ev.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl bg-[#F8FAFB] border border-border-light hover:bg-white transition-all"
                      style={{ padding: '14px 16px', gap: '12px' }}
                    >
                      <div className="flex items-start" style={{ gap: '12px' }}>
                        <span
                          className="text-xs font-mono font-semibold text-text-muted tabular-nums shrink-0"
                          style={{ minWidth: '72px', paddingTop: '2px' }}
                        >
                          {new Date(ev.time).toLocaleTimeString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </span>

                        <div>
                          <div className="flex items-center flex-wrap" style={{ gap: '8px' }}>
                            <span className="text-[13.5px] font-bold text-text-primary">
                              {ev.title}
                            </span>
                            {ev.businessName && (
                              <Link
                                href={`/admin/leads/${ev.leadId}`}
                                className="text-[13px] font-semibold text-primary-700 hover:underline"
                              >
                                • #{ev.leadNumber} {ev.businessName}
                              </Link>
                            )}
                            {ev.leadStatus && <LeadStatusBadge status={ev.leadStatus} />}
                          </div>
                          <p className="text-[13px] text-text-secondary mt-1 leading-relaxed">
                            {ev.description}
                          </p>
                        </div>
                      </div>

                      {ev.leadId && (
                        <Link
                          href={`/admin/leads/${ev.leadId}`}
                          className="inline-flex items-center text-xs font-semibold text-primary-600 hover:text-primary-700 shrink-0"
                          style={{ gap: '4px' }}
                        >
                          <span>View Lead</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </PageCard>
            ))
          )}
        </div>
      )}

      {/* TAB 2: CALL HISTORY & OUTCOMES */}
      {activeTab === 'calls' && (
        <DataTable
          headers={[
            { label: 'Date & Time' },
            { label: 'Lead & Business' },
            { label: 'Phone' },
            { label: 'Call Outcome' },
            { label: 'Duration', align: 'center' },
            { label: 'Current Stage' },
            { label: 'Call Remark / Notes' },
          ]}
          isEmpty={calls.length === 0}
          emptyState={
            <span className="text-sm text-text-muted">
              No calls logged by {employee.full_name} yet.
            </span>
          }
        >
          {calls.map((c: any) => {
            const mins = Math.floor((c.duration_seconds || 180) / 60);
            const secs = (c.duration_seconds || 180) % 60;
            return (
              <DataTableRow key={c.id}>
                <DataTableCell className="tabular-nums text-text-muted whitespace-nowrap">
                  {formatDateTime(c.created_at)}
                </DataTableCell>
                <DataTableCell>
                  {c.lead ? (
                    <Link
                      href={`/admin/leads/${c.lead.id}`}
                      className="font-bold text-text-primary hover:text-primary-600"
                    >
                      #{c.lead.lead_number} • {c.lead.business_name}
                    </Link>
                  ) : (
                    <span className="text-text-muted">Lead Record</span>
                  )}
                </DataTableCell>
                <DataTableCell className="tabular-nums font-medium text-text-secondary whitespace-nowrap">
                  {c.lead?.phone || '—'}
                </DataTableCell>
                <DataTableCell>
                  <span
                    className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold whitespace-nowrap"
                    style={{ padding: '4px 10px', gap: '6px' }}
                  >
                    <Phone className="w-3 h-3" />
                    <span>
                      {callOutcomeLabels[c.call_outcome] || c.call_outcome || 'Connected'}
                    </span>
                  </span>
                </DataTableCell>
                <DataTableCell align="center" className="tabular-nums text-text-secondary font-semibold">
                  {`${mins}m ${secs}s`}
                </DataTableCell>
                <DataTableCell>
                  {c.lead?.status ? <LeadStatusBadge status={c.lead.status} /> : '—'}
                </DataTableCell>
                <DataTableCell className="text-text-secondary max-w-xs truncate">
                  {c.description || '—'}
                </DataTableCell>
              </DataTableRow>
            );
          })}
        </DataTable>
      )}

      {/* TAB 3: STAGE MARKINGS & OUTCOME SUMMARY */}
      {activeTab === 'markings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Call Outcomes Summary Card */}
          <PageCard>
            <PageCardHeader
              title="Call Outcome Markings Summary"
              description="Distribution of call results marked by this representative"
              icon={Activity}
            />
            <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: '12px' }}>
              {Object.entries(stats.outcomeBreakdown || {}).length === 0 ? (
                <p className="col-span-full text-[13px] text-text-muted py-4">
                  No call outcome markings recorded yet.
                </p>
              ) : (
                Object.entries(stats.outcomeBreakdown).map(([outcome, qty]: [string, any]) => (
                  <div
                    key={outcome}
                    className="rounded-xl bg-[#F8FAFB] border border-border-light"
                    style={{ padding: '14px 16px' }}
                  >
                    <span className="text-xs font-semibold text-text-secondary block capitalize">
                      {callOutcomeLabels[outcome] || outcome.replace(/_/g, ' ')}
                    </span>
                    <span className="text-2xl font-bold text-text-primary tabular-nums mt-1 block">
                      {formatNumber(qty)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </PageCard>

          <DataTable
            headers={[
              { label: 'Timestamp' },
              { label: 'Lead & Business' },
              { label: 'Marking / Action' },
              { label: 'Current Lead Stage' },
              { label: 'Marking Notes' },
            ]}
            isEmpty={markings.length === 0}
            emptyState={
              <span className="text-sm text-text-muted">
                No stage markings recorded by {employee.full_name} yet.
              </span>
            }
          >
            {markings.map((m: any) => (
              <DataTableRow key={m.id}>
                <DataTableCell className="tabular-nums text-text-muted whitespace-nowrap">
                  {formatDateTime(m.created_at)}
                </DataTableCell>
                <DataTableCell>
                  {m.lead ? (
                    <Link
                      href={`/admin/leads/${m.lead.id}`}
                      className="font-bold text-text-primary hover:text-primary-600"
                    >
                      #{m.lead.lead_number} • {m.lead.business_name}
                    </Link>
                  ) : (
                    '—'
                  )}
                </DataTableCell>
                <DataTableCell className="font-semibold text-primary-700 capitalize">
                  {m.call_outcome
                    ? `Call: ${callOutcomeLabels[m.call_outcome] || m.call_outcome}`
                    : m.activity_type.replace(/_/g, ' ')}
                </DataTableCell>
                <DataTableCell>
                  {m.lead?.status ? <LeadStatusBadge status={m.lead.status} /> : '—'}
                </DataTableCell>
                <DataTableCell className="text-text-secondary max-w-md">
                  {m.description}
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTable>
        </div>
      )}

      {/* TAB 4: REMARKS & CONVERSATION NOTES */}
      {activeTab === 'remarks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {remarks.length === 0 ? (
            <PageCard className="text-center py-14">
              <MessageSquare className="w-10 h-10 text-text-muted/40 mx-auto mb-3" />
              <p className="text-[15px] font-bold text-text-primary">
                No conversation remarks logged yet
              </p>
            </PageCard>
          ) : (
            remarks.map((rem: any) => (
              <PageCard key={rem.id}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border-light mb-3">
                  <div className="flex items-center flex-wrap" style={{ gap: '10px' }}>
                    {rem.lead && (
                      <Link
                        href={`/admin/leads/${rem.lead.id}`}
                        className="text-[14px] font-bold text-primary-700 hover:underline"
                      >
                        Lead #{rem.lead.lead_number} • {rem.lead.business_name}
                      </Link>
                    )}
                    {rem.lead?.status && <LeadStatusBadge status={rem.lead.status} />}
                  </div>
                  <span className="text-xs text-text-muted tabular-nums">
                    {formatDateTime(rem.created_at)}
                  </span>
                </div>
                <p className="text-[13.5px] text-text-primary leading-relaxed whitespace-pre-line">
                  {rem.remark}
                </p>
              </PageCard>
            ))
          )}
        </div>
      )}

      {/* TAB 5: ASSIGNED & PENDING LEADS */}
      {activeTab === 'leads' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            className="flex items-center flex-wrap bg-white rounded-2xl border border-border shadow-xs"
            style={{ padding: '12px 16px', gap: '8px' }}
          >
            {[
              { id: 'all', label: `All Assigned (${assignedLeads.length})` },
              {
                id: 'pending_queue',
                label: `Pending & Action Needed (${stats.pendingLeads})`,
              },
              { id: 'new', label: `Untouched New (${stats.stageBreakdown.new})` },
              { id: 'contacted', label: `Contacted (${stats.stageBreakdown.contacted})` },
              { id: 'interested', label: `Interested (${stats.stageBreakdown.interested})` },
              { id: 'follow_up', label: `Follow-up (${stats.stageBreakdown.follow_up})` },
              { id: 'pending', label: `Pending Decision (${stats.stageBreakdown.pending})` },
              { id: 'confirmed', label: `Confirmed Won (${stats.stageBreakdown.confirmed})` },
              { id: 'not_interested', label: `Closed Lost (${stats.stageBreakdown.not_interested})` },
            ].map((f) => {
              const active = leadFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setLeadFilter(f.id)}
                  className="rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  style={{
                    padding: '7px 13px',
                    backgroundColor: active ? '#E8F3F1' : '#F8FAFB',
                    color: active ? '#0E5F58' : '#68717D',
                    border: `1px solid ${active ? '#24988A' : '#E7EAEE'}`,
                    fontWeight: active ? 700 : 600,
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <DataTable
            headers={[
              { label: 'Lead ID' },
              { label: 'Business & Contact' },
              { label: 'Phone' },
              { label: 'Category & City' },
              { label: 'Stage Marking' },
              { label: 'Priority' },
              { label: 'Assigned On' },
              { label: 'Open', align: 'right' },
            ]}
            isEmpty={filteredLeads.length === 0}
            emptyState={
              <span className="text-sm text-text-muted">
                No assigned leads matching this stage filter.
              </span>
            }
          >
            {filteredLeads.map((lead: any) => (
              <DataTableRow key={lead.id}>
                <DataTableCell className="font-bold text-primary-700 tabular-nums">
                  <Link href={`/admin/leads/${lead.id}`} className="hover:underline">
                    #{lead.lead_number}
                  </Link>
                </DataTableCell>
                <DataTableCell>
                  <div className="flex flex-col">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="font-bold text-text-primary hover:text-primary-600"
                    >
                      {lead.business_name}
                    </Link>
                    {lead.contact_person && (
                      <span className="text-xs text-text-muted">{lead.contact_person}</span>
                    )}
                  </div>
                </DataTableCell>
                <DataTableCell className="tabular-nums font-medium text-text-secondary whitespace-nowrap">
                  {lead.phone || '—'}
                </DataTableCell>
                <DataTableCell className="text-text-secondary">
                  {lead.category || '—'}
                  {lead.city ? ` • ${lead.city}` : ''}
                </DataTableCell>
                <DataTableCell>
                  <LeadStatusBadge status={lead.status} />
                </DataTableCell>
                <DataTableCell>
                  <LeadPriorityBadge priority={lead.priority} />
                </DataTableCell>
                <DataTableCell className="tabular-nums text-text-muted whitespace-nowrap">
                  {formatDate(lead.assigned_at || lead.created_at)}
                </DataTableCell>
                <DataTableCell align="right">
                  <Link
                    href={`/admin/leads/${lead.id}`}
                    className="inline-flex items-center text-xs font-semibold text-primary-600 hover:text-primary-700"
                    style={{ gap: '4px' }}
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTable>
        </div>
      )}

      {/* Direct Bulk Lead Assignment Modal for this Representative */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Leads to {employee.full_name}</DialogTitle>
            <DialogDescription>
              Currently <strong>{formatNumber(unassignedPoolCount)} unassigned leads</strong> are available in the database pool. Choose a preset or enter any custom quantity.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleAssignToEmployee}
            style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
          >
            {errorMsg && (
              <div
                className="rounded-xl bg-danger-bg border border-danger/30 text-danger text-xs font-semibold"
                style={{ padding: '12px 14px' }}
              >
                {errorMsg}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Label className="text-[13px] font-semibold text-text-primary">
                Quick Quantity Presets
              </Label>
              <div className="grid grid-cols-3 sm:grid-cols-6" style={{ gap: '8px' }}>
                {['25', '50', '100', '250', '500', 'ALL'].map((preset) => {
                  const isSelected = assignQty === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAssignQty(preset)}
                      className="rounded-xl border text-xs font-bold tabular-nums transition-all cursor-pointer"
                      style={{
                        padding: '10px 6px',
                        backgroundColor: isSelected ? '#147D72' : '#F8FAFB',
                        color: isSelected ? '#FFFFFF' : '#525B68',
                        borderColor: isSelected ? '#147D72' : '#E7EAEE',
                      }}
                    >
                      {preset === 'ALL' ? `All (${unassignedPoolCount})` : preset}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Label className="text-[13px] font-semibold text-text-primary">
                Or Enter Exact Custom Quantity
              </Label>
              <Input
                type="number"
                min={1}
                max={Math.max(1, unassignedPoolCount)}
                placeholder="e.g. 150, 350, 925..."
                value={assignQty === 'ALL' ? unassignedPoolCount : assignQty}
                onChange={(e) => setAssignQty(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAssignOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={assigning || unassignedPoolCount === 0}>
                {assigning
                  ? 'Allocating Leads...'
                  : `Assign ${
                      assignQty === 'ALL' ? formatNumber(unassignedPoolCount) : assignQty
                    } Leads Now`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminPageContainer>
  );
}
