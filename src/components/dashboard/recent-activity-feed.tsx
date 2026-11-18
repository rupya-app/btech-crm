import React from 'react';
import Link from 'next/link';
import { Phone, CheckCircle2, AlertCircle, Clock, Star, MessageSquare } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

export function RecentActivityFeed() {
  const activities = [
    {
      id: '1',
      title: 'Lead Confirmed',
      desc: 'Dr. Arun Nair confirmed software subscription for Vanguard Healthtech Labs.',
      time: new Date(Date.now() - 3600000 * 2).toISOString(),
      icon: CheckCircle2,
      color: 'text-success bg-success-bg',
      link: '/admin/leads/b0000000-0000-0000-0000-000000000003',
    },
    {
      id: '2',
      title: 'Call Connected & Remark Added',
      desc: 'Priya Sharma spoke with Rajesh Verma (Apex Logistics). Pricing proposal requested.',
      time: new Date(Date.now() - 3600000 * 5).toISOString(),
      icon: Phone,
      color: 'text-primary-600 bg-primary-50',
      link: '/admin/leads/b0000000-0000-0000-0000-000000000001',
    },
    {
      id: '3',
      title: 'Follow-up Scheduled',
      desc: 'Vikram Patel scheduled follow-up for tomorrow 11:30 AM with Zenith Engineering.',
      time: new Date(Date.now() - 3600000 * 7).toISOString(),
      icon: Clock,
      color: 'text-warning bg-warning-bg',
      link: '/admin/leads/b0000000-0000-0000-0000-000000000004',
    },
    {
      id: '4',
      title: 'New Lead Claimed',
      desc: 'Rahul Varma claimed UrbanCraft Modern Furniture from unassigned pool.',
      time: new Date(Date.now() - 3600000 * 9).toISOString(),
      icon: Star,
      color: 'text-info bg-info-bg',
      link: '/admin/leads/b0000000-0000-0000-0000-000000000006',
    },
  ];

  return (
    <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Recent Live Activities</h3>
          <p className="text-[11px] text-text-muted">Real-time audit log of team actions</p>
        </div>
        <Link
          href="/admin/activity-logs"
          className="text-xs font-medium text-primary-600 hover:text-primary-700"
        >
          View all
        </Link>
      </div>

      <div className="space-y-4">
        {activities.map((act) => {
          const Icon = act.icon;
          return (
            <div key={act.id} className="flex items-start gap-3 group">
              <div className={`p-2 rounded-xl shrink-0 ${act.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={act.link}
                    className="text-xs font-semibold text-text-primary group-hover:text-primary-600 truncate"
                  >
                    {act.title}
                  </Link>
                  <span className="text-[10px] text-text-muted shrink-0 tabular-nums">
                    {formatRelativeTime(act.time)}
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-2">
                  {act.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
