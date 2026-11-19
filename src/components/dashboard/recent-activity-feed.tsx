import React from 'react';
import Link from 'next/link';
import { Phone, CheckCircle2, Clock, Star, Activity, UserPlus } from 'lucide-react';
import { getDbClient } from '@/lib/supabase/server';
import { formatRelativeTime } from '@/lib/utils';

export async function RecentActivityFeed() {
  const supabase = await getDbClient();
  const { data } = await supabase
    .from('lead_activities')
    .select('id, lead_id, activity_type, call_outcome, description, created_at, lead:leads(business_name)')
    .order('created_at', { ascending: false })
    .limit(6);

  const activities = (data || []).map((a: any) => {
    let icon = Phone;
    let bg = '#CCFBF1';
    let color = '#0D9488';
    let border = '#99F6E4';
    let title = a.activity_type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());

    if (a.activity_type.includes('confirm')) {
      icon = CheckCircle2;
      bg = '#D1FAE5';
      color = '#059669';
      border = '#A7F3D0';
      title = `Deal Confirmed: ${a.lead?.business_name || ''}`;
    } else if (a.activity_type.includes('followup')) {
      icon = Clock;
      bg = '#F3E8FF';
      color = '#7C3AED';
      border = '#DDD6FE';
      title = `Follow-up: ${a.lead?.business_name || ''}`;
    } else if (a.activity_type.includes('assign') || a.activity_type.includes('claim')) {
      icon = UserPlus;
      bg = '#E0F2FE';
      color = '#0284C7';
      border = '#BAE6FD';
      title = `Lead Assigned: ${a.lead?.business_name || ''}`;
    } else if (a.call_outcome) {
      title = `Call (${a.call_outcome.replace(/_/g, ' ')}): ${a.lead?.business_name || ''}`;
    }

    return {
      id: a.id,
      title,
      desc: a.description || 'Activity recorded in pipeline.',
      time: a.created_at,
      icon,
      bg,
      color,
      border,
      link: `/admin/leads/${a.lead_id}`,
    };
  });

  return (
    <div
      className="rounded-2xl bg-white border border-border shadow-xs"
      style={{ padding: '24px 26px' }}
    >
      <div
        className="flex items-center justify-between border-b border-border-light"
        style={{ paddingBottom: '16px', marginBottom: '20px' }}
      >
        <div className="flex items-center" style={{ gap: '10px' }}>
          <div
            className="rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100"
            style={{ width: '36px', height: '36px' }}
          >
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-text-primary">Recent Live Activities</h3>
            <p className="text-[12px] text-text-muted">Real-time audit log from database</p>
          </div>
        </div>
        <Link
          href="/admin/activity-logs"
          className="text-[13px] font-semibold text-primary-600 hover:text-primary-700"
        >
          View all →
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-[13px] text-text-muted">
          No recent activities recorded yet.
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: '14px' }}>
          {activities.map((act) => {
            const Icon = act.icon;
            return (
              <div
                key={act.id}
                className="flex items-start group rounded-xl bg-[#F8FAFB] border border-border-light hover:bg-white hover:border-border transition-all"
                style={{ padding: '14px', gap: '12px' }}
              >
                <div
                  className="rounded-xl shrink-0 flex items-center justify-center"
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: act.bg,
                    color: act.color,
                    border: `1px solid ${act.border}`,
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between" style={{ gap: '8px' }}>
                    <Link
                      href={act.link}
                      className="text-[13px] font-bold text-text-primary group-hover:text-primary-600 truncate"
                    >
                      {act.title}
                    </Link>
                    <span className="text-[11px] text-text-muted shrink-0 tabular-nums font-medium">
                      {formatRelativeTime(act.time)}
                    </span>
                  </div>
                  <p
                    className="text-[12.5px] text-text-secondary line-clamp-2 leading-relaxed"
                    style={{ marginTop: '4px' }}
                  >
                    {act.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
