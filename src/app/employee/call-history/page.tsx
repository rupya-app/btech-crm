import React from 'react';
import Link from 'next/link';
import { Phone, ArrowRight, CheckCircle2, Clock, PhoneCall, AlertCircle } from 'lucide-react';
import {
  AdminPageContainer,
  PageHeader,
  DataTable,
  DataTableRow,
  DataTableCell,
  PageCard,
} from '@/components/common';
import { getDbClient } from '@/lib/supabase/server';
import { getCurrentUserId } from '@/services/leads.service';
import { formatDateTime, callOutcomeLabels } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const OUTCOME_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  connected: { bg: '#D1FAE5', text: '#065F46', border: '#A7F3D0', label: 'Connected / Spoke' },
  call_back: { bg: '#CCFBF1', text: '#115E59', border: '#99F6E4', label: 'Call Back Requested' },
  busy: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A', label: 'Busy Line' },
  no_answer: { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE', label: 'No Answer / Ringing' },
  wrong_number: { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5', label: 'Wrong Number' },
  not_reachable: { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1', label: 'Not Reachable' },
  switched_off: { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1', label: 'Switched Off' },
  other: { bg: '#F3E8FF', text: '#6D28D9', border: '#DDD6FE', label: 'Other Outcome' },
};

export default async function EmployeeCallHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ outcome?: string }>;
}) {
  const params = await searchParams;
  const outcomeFilter = params.outcome || 'all';
  const employeeId = await getCurrentUserId();
  const supabase = await getDbClient();

  let query = supabase
    .from('lead_activities')
    .select(
      'id, lead_id, employee_id, activity_type, call_outcome, duration_seconds, description, created_at, lead:leads(id, lead_number, business_name, contact_person, phone, status)'
    )
    .order('created_at', { ascending: false })
    .limit(100);

  if (employeeId) {
    query = query.eq('employee_id', employeeId);
  }

  const { data } = await query;

  const allCalls = (data || []).filter(
    (c: any) => c.activity_type === 'call_outcome' || Boolean(c.call_outcome)
  ).map((c: any) => {
    const mins = Math.floor((c.duration_seconds || 120) / 60);
    const secs = (c.duration_seconds || 120) % 60;
    const key = c.call_outcome || 'other';
    const style = OUTCOME_STYLES[key] || OUTCOME_STYLES.other;

    return {
      id: c.id,
      leadId: c.lead_id,
      leadNumber: c.lead?.lead_number,
      businessName: c.lead?.business_name || 'Client Business',
      contact: c.lead?.contact_person || 'Primary Contact',
      phone: c.lead?.phone || '—',
      time: c.created_at,
      duration: c.duration_seconds ? `${mins}m ${secs}s` : '1m 30s',
      outcomeKey: key,
      outcomeLabel: style.label,
      outcomeStyle: style,
      remark: c.description || 'Call logged',
    };
  });

  const counts = {
    all: allCalls.length,
    connected: allCalls.filter((c) => c.outcomeKey === 'connected').length,
    call_back: allCalls.filter((c) => c.outcomeKey === 'call_back').length,
    busy: allCalls.filter((c) => c.outcomeKey === 'busy').length,
    no_answer: allCalls.filter((c) => c.outcomeKey === 'no_answer').length,
  };

  const filteredCalls = allCalls.filter((c) => {
    if (outcomeFilter === 'all') return true;
    return c.outcomeKey === outcomeFilter;
  });

  return (
    <AdminPageContainer>
      <PageHeader
        title="My Telecalling Call History"
        badge={
          <span
            className="inline-flex items-center rounded-full text-xs font-bold tracking-wide"
            style={{
              padding: '4px 12px',
              gap: '6px',
              backgroundColor: '#DBEAFE',
              color: '#1D4ED8',
              border: '1px solid #93C5FD',
            }}
          >
            <Phone className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Outbound Call Records</span>
          </span>
        }
        description="Chronological log of all outbound phone calls made by you, recorded call outcomes, and customer remarks."
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4" style={{ gap: '16px' }}>
        <PageCard style={{ borderLeft: '4px solid #3B82F6' }}>
          <span className="text-xs font-semibold text-text-secondary">Total Calls Logged</span>
          <div className="mt-2 text-3xl font-bold text-text-primary tabular-nums">{counts.all}</div>
          <span className="text-xs text-text-muted mt-1 block">In your account history</span>
        </PageCard>

        <PageCard style={{ borderLeft: '4px solid #10B981' }}>
          <span className="text-xs font-semibold text-text-secondary">Connected & Spoke</span>
          <div className="mt-2 text-3xl font-bold text-success tabular-nums">{counts.connected}</div>
          <span className="text-xs text-text-muted mt-1 block">Productive conversations</span>
        </PageCard>

        <PageCard style={{ borderLeft: '4px solid #14B8A6' }}>
          <span className="text-xs font-semibold text-text-secondary">Call Backs Scheduled</span>
          <div className="mt-2 text-3xl font-bold text-primary-700 tabular-nums">{counts.call_back}</div>
          <span className="text-xs text-text-muted mt-1 block">Pending follow-up</span>
        </PageCard>

        <PageCard style={{ borderLeft: '4px solid #F59E0B' }}>
          <span className="text-xs font-semibold text-text-secondary">Busy / No Answer</span>
          <div className="mt-2 text-3xl font-bold text-warning tabular-nums">
            {counts.busy + counts.no_answer}
          </div>
          <span className="text-xs text-text-muted mt-1 block">To be retried</span>
        </PageCard>
      </div>

      {/* Filter Tabs */}
      <div
        className="rounded-2xl bg-white border border-[#E7EAEE] shadow-xs flex items-center overflow-x-auto scrollbar-none"
        style={{ padding: '12px 16px', gap: '8px' }}
      >
        {[
          { id: 'all', label: `All Calls (${counts.all})` },
          { id: 'connected', label: `Connected (${counts.connected})` },
          { id: 'call_back', label: `Call Back (${counts.call_back})` },
          { id: 'busy', label: `Busy (${counts.busy})` },
          { id: 'no_answer', label: `No Answer (${counts.no_answer})` },
        ].map((tab) => {
          const isActive = outcomeFilter === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.id === 'all' ? '/employee/call-history' : `/employee/call-history?outcome=${tab.id}`}
              className="rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap"
              style={{
                padding: '7px 14px',
                backgroundColor: isActive ? '#147D72' : '#F8FAFB',
                color: isActive ? '#FFFFFF' : '#525B68',
                border: `1px solid ${isActive ? '#147D72' : '#E7EAEE'}`,
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <DataTable
        headers={[
          { label: 'Business & Contact' },
          { label: 'Phone' },
          { label: 'Call Outcome' },
          { label: 'Duration', align: 'center' },
          { label: 'Call Time (IST)' },
          { label: 'Remark / Notes' },
          { label: 'Lead', align: 'right' },
        ]}
        isEmpty={filteredCalls.length === 0}
        emptyState={
          <div className="text-center py-10">
            <PhoneCall className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
            <span className="text-sm text-text-muted block font-medium">
              No calls match this outcome filter. Open any lead from your pipeline to log calls.
            </span>
          </div>
        }
      >
        {filteredCalls.map((c) => (
          <DataTableRow key={c.id}>
            <DataTableCell>
              <div className="flex flex-col">
                <span className="font-bold text-text-primary text-[13.5px]">{c.businessName}</span>
                <span className="text-[12px] text-text-muted mt-0.5">{c.contact}</span>
              </div>
            </DataTableCell>
            <DataTableCell className="tabular-nums text-text-secondary font-medium whitespace-nowrap">
              <a href={`tel:${c.phone}`} className="hover:underline text-primary-700">
                {c.phone}
              </a>
            </DataTableCell>
            <DataTableCell>
              <span
                className="inline-flex items-center rounded-full font-semibold text-xs whitespace-nowrap"
                style={{
                  padding: '4px 10px',
                  gap: '6px',
                  backgroundColor: c.outcomeStyle.bg,
                  color: c.outcomeStyle.text,
                  border: `1px solid ${c.outcomeStyle.border}`,
                }}
              >
                <Phone className="w-3 h-3" />
                <span>{c.outcomeLabel}</span>
              </span>
            </DataTableCell>
            <DataTableCell align="center" className="tabular-nums text-text-secondary font-semibold whitespace-nowrap">
              {c.duration}
            </DataTableCell>
            <DataTableCell className="text-text-muted tabular-nums whitespace-nowrap text-xs">
              {formatDateTime(c.time)}
            </DataTableCell>
            <DataTableCell className="text-text-secondary italic max-w-sm truncate text-xs">
              &ldquo;{c.remark}&rdquo;
            </DataTableCell>
            <DataTableCell align="right">
              <Link
                href={`/employee/my-leads/${c.leadId}`}
                className="p-2 rounded-xl text-primary-600 hover:bg-primary-50 inline-flex items-center transition-colors"
                title="Open lead details"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTable>
    </AdminPageContainer>
  );
}
