import React from 'react';
import Link from 'next/link';
import { Phone, CheckCircle2, UserPlus, Clock, Activity } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { getDbClient } from '@/lib/supabase/server';
import { AdminPageContainer, PageHeader, DataTable, DataTableRow, DataTableCell } from '@/components/common';

export const dynamic = 'force-dynamic';

export default async function AdminActivityLogsPage() {
  const supabase = await getDbClient();
  const { data } = await supabase
    .from('lead_activities')
    .select(
      'id, lead_id, activity_type, call_outcome, description, created_at, lead:leads(lead_number, business_name), employee:profiles(full_name, employee_id)'
    )
    .order('created_at', { ascending: false })
    .limit(100);

  const logs = (data || []).map((l: any) => {
    let icon = Activity;
    let color = 'text-primary-600 bg-primary-50';
    let action = l.activity_type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c: string) => c.toUpperCase());

    if (l.call_outcome) {
      icon = Phone;
      action = `Call Outcome: ${l.call_outcome.replace(/_/g, ' ')}`;
    } else if (l.activity_type.includes('assign') || l.activity_type.includes('claim')) {
      icon = UserPlus;
      color = 'text-accent-blue bg-accent-blue-soft';
    } else if (l.activity_type.includes('confirm')) {
      icon = CheckCircle2;
      color = 'text-success bg-success-bg';
    } else if (l.activity_type.includes('followup')) {
      icon = Clock;
      color = 'text-warning bg-warning-bg';
    }

    return {
      id: l.id,
      leadId: l.lead_id,
      actor: l.employee
        ? `${l.employee.full_name} (${l.employee.employee_id})`
        : 'System / Administrator',
      action,
      details: l.description || 'Pipeline event recorded',
      entity: l.lead
        ? `Lead #${l.lead.lead_number} (${l.lead.business_name})`
        : 'Lead Record',
      time: l.created_at,
      icon,
      color,
    };
  });

  return (
    <AdminPageContainer>
      <PageHeader
        title="System Activity & Audit Logs"
        description="Immutable event stream capturing administrative actions, call records, status transitions, and data operations."
      />

      <DataTable
        headers={[
          { label: 'Event & Action' },
          { label: 'Actor / Employee' },
          { label: 'Target Entity' },
          { label: 'Event Details' },
          { label: 'Timestamp', align: 'right' },
        ]}
        isEmpty={logs.length === 0}
        emptyState={
          <span className="text-sm text-text-muted">
            No activity logs recorded in the database yet.
          </span>
        }
      >
        {logs.map((l) => {
          const Icon = l.icon;
          return (
            <DataTableRow key={l.id}>
              <DataTableCell>
                <div className="flex items-center" style={{ gap: '12px' }}>
                  <div className={`p-2 rounded-xl shrink-0 ${l.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-text-primary">{l.action}</span>
                </div>
              </DataTableCell>
              <DataTableCell className="font-medium text-text-secondary">{l.actor}</DataTableCell>
              <DataTableCell className="font-semibold text-primary-700">
                <Link href={`/admin/leads/${l.leadId}`} className="hover:underline">
                  {l.entity}
                </Link>
              </DataTableCell>
              <DataTableCell className="text-text-secondary max-w-md leading-relaxed">
                {l.details}
              </DataTableCell>
              <DataTableCell align="right" className="tabular-nums text-text-muted whitespace-nowrap">
                {formatDateTime(l.time)}
              </DataTableCell>
            </DataTableRow>
          );
        })}
      </DataTable>
    </AdminPageContainer>
  );
}
