import React from 'react';
import Link from 'next/link';
import { CheckCircle2, TrendingUp, Trophy, ArrowRight, Phone } from 'lucide-react';
import {
  AdminPageContainer,
  PageHeader,
  PageCard,
  DataTable,
  DataTableRow,
  DataTableCell,
} from '@/components/common';
import { getLeads, getLeadStatusCounts, getCurrentUserId } from '@/services/leads.service';
import { formatDateTime } from '@/lib/utils';
import { LeadPriorityBadge } from '@/components/leads/lead-priority-badge';

export const dynamic = 'force-dynamic';

export default async function EmployeeConfirmedLeadsPage() {
  const employeeId = await getCurrentUserId();
  const [{ data: leads, total }, statusCounts] = await Promise.all([
    getLeads({
      status: 'confirmed',
      employeeId: employeeId || undefined,
      pageSize: 100,
    }),
    getLeadStatusCounts(employeeId || undefined),
  ]);

  const totalAssigned = statusCounts.all || 1;
  const winRate = Math.round((total / totalAssigned) * 100);

  return (
    <AdminPageContainer>
      <PageHeader
        title="My Confirmed Won Deals"
        badge={
          <span
            className="inline-flex items-center rounded-full text-xs font-bold tracking-wide"
            style={{
              padding: '4px 12px',
              gap: '6px',
              backgroundColor: '#D1FAE5',
              color: '#065F46',
              border: '1px solid #6EE7B7',
            }}
          >
            <Trophy className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Closed Won Milestone</span>
          </span>
        }
        description="Review all successfully converted accounts, confirmed client orders, and deal onboarding details."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: '16px' }}>
        <PageCard style={{ borderLeft: '4px solid #10B981' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">Confirmed Deals Won</span>
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <div className="mt-2 text-3xl font-bold text-success tabular-nums">{total}</div>
          <span className="text-xs text-text-muted mt-1 block">Successfully closed accounts</span>
        </PageCard>

        <PageCard style={{ borderLeft: '4px solid #147D72' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">Personal Win Rate</span>
            <TrendingUp className="w-4 h-4 text-primary-600" />
          </div>
          <div className="mt-2 text-3xl font-bold text-primary-700 tabular-nums">{winRate}%</div>
          <span className="text-xs text-text-muted mt-1 block">Of all your assigned leads</span>
        </PageCard>

        <PageCard style={{ borderLeft: '4px solid #0EA5E9' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">Pipeline Conversion</span>
            <Trophy className="w-4 h-4 text-[#0EA5E9]" />
          </div>
          <div className="mt-2 text-3xl font-bold text-text-primary tabular-nums">
            {total} / {totalAssigned}
          </div>
          <span className="text-xs text-text-muted mt-1 block">Leads converted to won status</span>
        </PageCard>
      </div>

      {/* Deals Table */}
      <DataTable
        headers={[
          { label: 'Lead ID' },
          { label: 'Business & Contact' },
          { label: 'Phone' },
          { label: 'Category' },
          { label: 'Priority' },
          { label: 'City' },
          { label: 'Deal Status' },
          { label: 'View', align: 'right' },
        ]}
        isEmpty={leads.length === 0}
        emptyState={
          <div className="text-center py-10">
            <Trophy className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
            <span className="text-sm text-text-muted block font-medium">
              No confirmed deals yet. Keep telecalling your pipeline leads and mark deals as "Confirmed Won" when closed!
            </span>
          </div>
        }
      >
        {leads.map((l) => (
          <DataTableRow key={l.id}>
            <DataTableCell className="font-mono text-xs font-bold text-primary-800">
              #{l.lead_number}
            </DataTableCell>
            <DataTableCell>
              <div className="flex flex-col">
                <span className="font-bold text-text-primary text-[13.5px]">{l.business_name}</span>
                <span className="text-[12px] text-text-muted mt-0.5">{l.contact_person || 'Primary Contact'}</span>
              </div>
            </DataTableCell>
            <DataTableCell className="tabular-nums text-text-secondary font-medium whitespace-nowrap">
              <a href={`tel:${l.phone}`} className="hover:underline text-primary-700">
                {l.phone || '—'}
              </a>
            </DataTableCell>
            <DataTableCell className="text-text-secondary text-xs">
              {l.category || 'General'}
            </DataTableCell>
            <DataTableCell>
              <LeadPriorityBadge priority={l.priority} />
            </DataTableCell>
            <DataTableCell className="text-text-muted text-xs">
              {l.city || '—'}
            </DataTableCell>
            <DataTableCell>
              <span
                className="inline-flex items-center rounded-full font-semibold text-xs whitespace-nowrap"
                style={{
                  padding: '4px 10px',
                  gap: '6px',
                  backgroundColor: '#D1FAE5',
                  color: '#065F46',
                  border: '1px solid #6EE7B7',
                }}
              >
                <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                <span>Confirmed Won</span>
              </span>
            </DataTableCell>
            <DataTableCell align="right">
              <Link
                href={`/employee/my-leads/${l.id}`}
                className="p-2 rounded-xl text-primary-600 hover:bg-primary-50 inline-flex items-center transition-colors"
                title="View deal record"
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
