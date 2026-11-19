import React from 'react';
import Link from 'next/link';
import { Phone, ArrowRight } from 'lucide-react';
import {
  AdminPageContainer,
  PageHeader,
  DataTable,
  DataTableRow,
  DataTableCell,
} from '@/components/common';
import { getDbClient } from '@/lib/supabase/server';
import { formatDateTime, callOutcomeLabels } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function EmployeeCallHistoryPage() {
  const supabase = await getDbClient();
  const { data } = await supabase
    .from('lead_activities')
    .select(
      'id, lead_id, activity_type, call_outcome, duration_seconds, description, created_at, lead:leads(business_name, contact_person, phone)'
    )
    .order('created_at', { ascending: false })
    .limit(50);

  const calls = (data || []).map((c: any) => {
    const mins = Math.floor((c.duration_seconds || 120) / 60);
    const secs = (c.duration_seconds || 120) % 60;
    return {
      id: c.id,
      leadId: c.lead_id,
      businessName: c.lead?.business_name || 'Client Business',
      contact: c.lead?.contact_person || 'Primary Contact',
      phone: c.lead?.phone || '—',
      time: c.created_at,
      duration: c.duration_seconds ? `${mins}m ${secs}s` : '—',
      outcome: c.call_outcome
        ? callOutcomeLabels[c.call_outcome] || c.call_outcome
        : c.activity_type.replace(/_/g, ' '),
      remark: c.description || 'Interaction recorded',
    };
  });

  return (
    <AdminPageContainer>
      <PageHeader
        title="Telecalling Log & History"
        description="Chronological record of all outbound calls, durations, and recorded customer responses from database."
      />

      <DataTable
        headers={[
          { label: 'Business & Contact' },
          { label: 'Phone' },
          { label: 'Outcome' },
          { label: 'Duration', align: 'center' },
          { label: 'Call Time' },
          { label: 'Remark' },
          { label: 'Lead', align: 'right' },
        ]}
        isEmpty={calls.length === 0}
        emptyState={
          <span className="text-sm text-text-muted">
            No call outcomes logged yet. Open any lead to record a call outcome.
          </span>
        }
      >
        {calls.map((c) => (
          <DataTableRow key={c.id}>
            <DataTableCell>
              <div className="flex flex-col">
                <span className="font-bold text-text-primary text-[13.5px]">{c.businessName}</span>
                <span className="text-[12px] text-text-muted mt-0.5">{c.contact}</span>
              </div>
            </DataTableCell>
            <DataTableCell className="tabular-nums text-text-secondary font-medium whitespace-nowrap">
              {c.phone}
            </DataTableCell>
            <DataTableCell>
              <span
                className="inline-flex items-center rounded-full bg-primary-50 text-primary-700 font-semibold text-xs border border-primary-200 whitespace-nowrap"
                style={{ padding: '4px 10px', gap: '6px' }}
              >
                <Phone className="w-3 h-3 text-primary-600" />
                <span className="capitalize">{c.outcome}</span>
              </span>
            </DataTableCell>
            <DataTableCell align="center" className="tabular-nums text-text-secondary font-semibold whitespace-nowrap">
              {c.duration}
            </DataTableCell>
            <DataTableCell className="text-text-muted tabular-nums whitespace-nowrap">
              {formatDateTime(c.time)}
            </DataTableCell>
            <DataTableCell className="text-text-secondary italic max-w-xs truncate">
              &ldquo;{c.remark}&rdquo;
            </DataTableCell>
            <DataTableCell align="right">
              <Link
                href={`/employee/my-leads/${c.leadId}`}
                className="p-2 rounded-xl text-primary-600 hover:bg-primary-50 inline-flex items-center transition-colors"
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
