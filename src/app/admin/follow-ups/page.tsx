'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  Phone,
  Calendar,
  CheckCircle2,
  User,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';
import {
  AdminPageContainer,
  PageHeader,
  FilterTabs,
  PageCard,
  SuccessNotice,
} from '@/components/common';

interface FollowupItem {
  id: string;
  leadId: string;
  businessName: string;
  contact: string;
  phone: string;
  time: string;
  purpose: string;
  assignedTo: string;
  status: string;
}

export default function AdminFollowupsPage() {
  const [filter, setFilter] = useState<'all' | 'due_today' | 'overdue' | 'completed'>('all');
  const [followups, setFollowups] = useState<FollowupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchFollowups = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/follow-ups');
      const data = await res.json();
      setFollowups(data.followups || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowups();
  }, []);

  const markCompleted = async (id: string, businessName: string) => {
    try {
      const res = await fetch('/api/follow-ups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'completed' }),
      });

      if (res.ok) {
        setFollowups((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: 'completed' } : f))
        );
        setNotice(`Follow-up for "${businessName}" marked as completed in database.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = followups.filter((f) => {
    if (filter === 'all') return true;
    return f.status === filter;
  });

  return (
    <AdminPageContainer>
      <PageHeader
        title="Scheduled Follow-ups & Callback Queue"
        description="Track upcoming sales calls, overdue callback reminders, and customer appointment schedules."
        actions={
          <FilterTabs
            tabs={[
              { id: 'all', label: `All (${followups.length})` },
              {
                id: 'due_today',
                label: `Due Today (${followups.filter((f) => f.status === 'due_today').length})`,
              },
              {
                id: 'overdue',
                label: `Overdue (${followups.filter((f) => f.status === 'overdue').length})`,
              },
              {
                id: 'completed',
                label: `Completed (${followups.filter((f) => f.status === 'completed').length})`,
              },
            ]}
            activeTab={filter}
            onTabChange={(id) => setFilter(id as any)}
          />
        }
      />

      {notice && <SuccessNotice message={notice} />}

      {!loading && filtered.length === 0 ? (
        <PageCard className="text-center py-14">
          <Clock className="w-10 h-10 text-text-muted/40 mx-auto mb-3" />
          <p className="text-[15px] font-bold text-text-primary">
            No follow-ups in this filter view
          </p>
          <p className="text-[13px] text-text-muted mt-1">
            Schedule a follow-up from any lead detail page to receive callback reminders here.
          </p>
        </PageCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '20px' }}>
          {filtered.map((item) => (
            <PageCard
              key={item.id}
              hover
              className="flex flex-col justify-between min-h-[220px]"
              style={{
                borderTop: `3.5px solid ${
                  item.status === 'overdue'
                    ? '#EF4444'
                    : item.status === 'due_today'
                    ? '#F59E0B'
                    : item.status === 'completed'
                    ? '#10B981'
                    : '#8B5CF6'
                }`,
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-3" style={{ gap: '8px' }}>
                  <span
                    className="text-[12.5px] font-semibold text-primary-700 bg-primary-50 rounded-full flex items-center border border-primary-200"
                    style={{ padding: '4px 12px', gap: '6px' }}
                  >
                    <Calendar className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                    {formatDateTime(item.time)}
                  </span>

                  {item.status === 'overdue' && (
                    <span
                      className="text-[11.5px] font-bold text-danger bg-danger-bg rounded-full border border-danger/30"
                      style={{ padding: '3px 10px' }}
                    >
                      Overdue
                    </span>
                  )}
                  {item.status === 'due_today' && (
                    <span
                      className="text-[11.5px] font-bold text-warning bg-warning-bg rounded-full border border-warning/30"
                      style={{ padding: '3px 10px' }}
                    >
                      Due Today
                    </span>
                  )}
                  {item.status === 'completed' && (
                    <span
                      className="text-[11.5px] font-bold text-success bg-success-bg rounded-full border border-success/30"
                      style={{ padding: '3px 10px' }}
                    >
                      Completed
                    </span>
                  )}
                </div>

                <h3 className="text-[15.5px] font-bold text-text-primary mt-2">
                  {item.businessName}
                </h3>
                <p className="text-[13px] text-text-secondary mt-1 font-medium">
                  {item.contact} • {item.phone}
                </p>

                <div
                  className="mt-3 rounded-xl bg-[#F8FAFB] border border-border-light text-[13px] text-text-secondary italic"
                  style={{ padding: '12px' }}
                >
                  &ldquo;{item.purpose}&rdquo;
                </div>

                <div className="mt-3 flex items-center text-[12px] text-text-muted" style={{ gap: '6px' }}>
                  <User className="w-3.5 h-3.5 text-text-muted" />
                  <span>Assigned: {item.assignedTo}</span>
                </div>
              </div>

              <div
                className="border-t border-border-light flex items-center justify-between"
                style={{ marginTop: '18px', paddingTop: '14px' }}
              >
                <a
                  href={`tel:${item.phone.replace(/\s/g, '')}`}
                  className="inline-flex items-center rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-semibold shadow-xs transition-colors"
                  style={{ padding: '7px 14px', gap: '6px' }}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Client</span>
                </a>

                <div className="flex items-center" style={{ gap: '8px' }}>
                  {item.status !== 'completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markCompleted(item.id, item.businessName)}
                      className="text-success hover:bg-success-bg border-success/30"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Done</span>
                    </Button>
                  )}
                  <Link
                    href={`/admin/leads/${item.leadId}`}
                    className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </PageCard>
          ))}
        </div>
      )}
    </AdminPageContainer>
  );
}
