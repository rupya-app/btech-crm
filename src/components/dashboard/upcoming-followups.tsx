import React from 'react';
import Link from 'next/link';
import { Clock, Phone, Calendar, ArrowRight, User } from 'lucide-react';
import { getDbClient } from '@/lib/supabase/server';
import { formatDateTime } from '@/lib/utils';

export async function UpcomingFollowups({ isAdmin = true }: { isAdmin?: boolean }) {
  const supabase = await getDbClient();
  const { data } = await supabase
    .from('follow_ups')
    .select(
      'id, lead_id, scheduled_at, purpose, notes, status, lead:leads(business_name, contact_person, phone), employee:profiles(full_name)'
    )
    .neq('status', 'completed')
    .neq('status', 'cancelled')
    .order('scheduled_at', { ascending: true })
    .limit(6);

  const followups = (data || []).map((f: any) => {
    const schedMs = new Date(f.scheduled_at).getTime();
    const isDueToday = schedMs <= new Date(new Date().setHours(23, 59, 59, 999)).getTime();
    return {
      id: f.id,
      leadId: f.lead_id,
      businessName: f.lead?.business_name || 'Client',
      contact: f.lead?.contact_person || 'Contact',
      phone: f.lead?.phone || '—',
      time: formatDateTime(f.scheduled_at),
      purpose: f.purpose || f.notes || 'Scheduled follow-up call',
      assignedTo: f.employee?.full_name || 'Unassigned',
      isDueToday,
    };
  });

  return (
    <div
      className="rounded-2xl bg-white border border-border shadow-xs"
      style={{ padding: '24px 28px' }}
    >
      <div
        className="flex items-center justify-between border-b border-border-light"
        style={{ paddingBottom: '16px', marginBottom: '20px' }}
      >
        <div className="flex items-center" style={{ gap: '12px' }}>
          <div
            className="rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200"
            style={{ width: '38px', height: '38px' }}
          >
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-text-primary">Upcoming Follow-ups</h3>
            <p className="text-[12.5px] text-text-muted">
              Live callback reminders from your database ({followups.length})
            </p>
          </div>
        </div>
        <Link
          href={isAdmin ? '/admin/follow-ups' : '/employee/follow-ups'}
          className="text-[13px] font-semibold text-primary-600 hover:text-primary-700"
        >
          View all →
        </Link>
      </div>

      {followups.length === 0 ? (
        <div className="text-center py-8 text-[13px] text-text-muted">
          No pending follow-ups scheduled right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '16px' }}>
          {followups.slice(0, 3).map((f) => (
            <div
              key={f.id}
              className="flex flex-col justify-between rounded-xl border bg-[#F8FAFB] hover:bg-white hover:shadow-sm transition-all group"
              style={{
                padding: '18px',
                borderColor: f.isDueToday ? '#FDE68A' : '#E7EAEE',
                borderTop: `3px solid ${f.isDueToday ? '#F59E0B' : '#8B5CF6'}`,
              }}
            >
              <div>
                <div
                  className="flex items-center justify-between"
                  style={{ gap: '8px', marginBottom: '12px' }}
                >
                  <span
                    className="inline-flex items-center text-[11px] font-semibold rounded-full"
                    style={{
                      padding: '3px 10px',
                      gap: '5px',
                      backgroundColor: f.isDueToday ? '#FEF3C7' : '#F3E8FF',
                      color: f.isDueToday ? '#92400E' : '#5B21B6',
                    }}
                  >
                    <Calendar className="w-3 h-3 shrink-0" />
                    {f.time}
                  </span>
                  {f.isDueToday && (
                    <span className="text-[10.5px] font-bold text-warning uppercase tracking-wider">
                      Due Today
                    </span>
                  )}
                </div>

                <h4 className="text-[14px] font-bold text-text-primary group-hover:text-primary-600 truncate">
                  {f.businessName}
                </h4>
                <p
                  className="text-[12.5px] text-text-secondary truncate"
                  style={{ marginTop: '4px' }}
                >
                  {f.contact} • {f.phone}
                </p>
                <p
                  className="text-[12px] text-text-muted line-clamp-1 italic"
                  style={{ marginTop: '10px' }}
                >
                  &ldquo;{f.purpose}&rdquo;
                </p>
              </div>

              <div
                className="border-t border-border-light flex items-center justify-between"
                style={{ marginTop: '16px', paddingTop: '12px' }}
              >
                {isAdmin && (
                  <div
                    className="flex items-center text-[11.5px] text-text-muted font-medium"
                    style={{ gap: '5px' }}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{f.assignedTo}</span>
                  </div>
                )}
                <div className="flex items-center ml-auto" style={{ gap: '8px' }}>
                  <a
                    href={`tel:${f.phone.replace(/\s/g, '')}`}
                    className="inline-flex items-center rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[12px] font-semibold shadow-xs transition-colors"
                    style={{ padding: '5px 12px', gap: '5px' }}
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call</span>
                  </a>
                  <Link
                    href={isAdmin ? `/admin/leads/${f.leadId}` : `/employee/my-leads/${f.leadId}`}
                    className="rounded-lg hover:bg-surface-muted text-text-muted hover:text-text-primary"
                    style={{ padding: '6px' }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
