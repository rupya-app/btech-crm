'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  Phone,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';
import {
  AdminPageContainer,
  PageHeader,
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
  status: 'due_today' | 'overdue' | 'scheduled' | 'completed';
}

export default function EmployeeFollowupsPage() {
  const [filter, setFilter] = useState<'all' | 'due_today' | 'overdue' | 'completed'>('all');
  const [followups, setFollowups] = useState<FollowupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState('');

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
        setNotice(`Follow-up for "${businessName}" marked as completed.`);
        setFollowups((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: 'completed' } : f))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const counts = {
    all: followups.length,
    due_today: followups.filter((f) => f.status === 'due_today').length,
    overdue: followups.filter((f) => f.status === 'overdue').length,
    completed: followups.filter((f) => f.status === 'completed').length,
  };

  const filtered = followups.filter((f) => {
    if (filter === 'due_today' && f.status !== 'due_today') return false;
    if (filter === 'overdue' && f.status !== 'overdue') return false;
    if (filter === 'completed' && f.status !== 'completed') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        f.businessName.toLowerCase().includes(q) ||
        f.contact.toLowerCase().includes(q) ||
        f.phone.includes(q) ||
        f.purpose.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AdminPageContainer>
      <PageHeader
        title="My Follow-up Queue"
        badge={
          <span
            className="inline-flex items-center rounded-full text-xs font-bold tracking-wide"
            style={{
              padding: '4px 12px',
              gap: '6px',
              backgroundColor: '#F3E8FF',
              color: '#6D28D9',
              border: '1px solid #C4B5FD',
            }}
          >
            <Clock className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Scheduled Callback Reminders</span>
          </span>
        }
        description="Priority queue of scheduled client callbacks, demo sessions, and contract reviews assigned to you."
      />

      {notice && <SuccessNotice message={notice} />}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: '16px' }}>
        <PageCard style={{ borderLeft: '4px solid #F59E0B' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">Due Today (IST)</span>
            <Calendar className="w-4 h-4 text-warning" />
          </div>
          <div className="mt-2 text-3xl font-bold text-text-primary tabular-nums">
            {counts.due_today}
          </div>
          <span className="text-xs text-text-muted mt-1 block">Scheduled for today</span>
        </PageCard>

        <PageCard style={{ borderLeft: '4px solid #EF4444' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">Overdue Reminders</span>
            <AlertTriangle className="w-4 h-4 text-danger" />
          </div>
          <div className="mt-2 text-3xl font-bold text-danger tabular-nums">
            {counts.overdue}
          </div>
          <span className="text-xs text-text-muted mt-1 block">Requires immediate telecall</span>
        </PageCard>

        <PageCard style={{ borderLeft: '4px solid #10B981' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">Completed Follow-ups</span>
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <div className="mt-2 text-3xl font-bold text-success tabular-nums">
            {counts.completed}
          </div>
          <span className="text-xs text-text-muted mt-1 block">Successfully executed</span>
        </PageCard>
      </div>

      {/* Filter Tabs & Search */}
      <div
        className="rounded-2xl bg-white border border-[#E7EAEE] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between"
        style={{ padding: '14px 18px', gap: '14px' }}
      >
        <div className="flex items-center overflow-x-auto scrollbar-none" style={{ gap: '8px' }}>
          {[
            { id: 'all', label: `All (${counts.all})` },
            { id: 'due_today', label: `Due Today (${counts.due_today})` },
            { id: 'overdue', label: `Overdue (${counts.overdue})` },
            { id: 'completed', label: `Completed (${counts.completed})` },
          ].map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as any)}
                className="rounded-xl text-[13px] font-semibold transition-all cursor-pointer whitespace-nowrap"
                style={{
                  padding: '7px 14px',
                  backgroundColor: isActive ? '#147D72' : '#F8FAFB',
                  color: isActive ? '#FFFFFF' : '#525B68',
                  border: `1px solid ${isActive ? '#147D72' : '#E7EAEE'}`,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search in follow-ups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs bg-[#F8FAFB] border border-[#E7EAEE] rounded-xl outline-none focus:border-[#147D72]"
          />
        </div>
      </div>

      {/* Follow-up Cards List */}
      {loading ? (
        <div className="p-12 text-center text-sm text-text-muted">Loading follow-ups...</div>
      ) : filtered.length === 0 ? (
        <PageCard style={{ textAlign: 'center', padding: '48px 20px' }}>
          <Clock className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <h3 className="text-base font-bold text-text-primary">No Follow-up Reminders</h3>
          <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
            You don't have any follow-up calls in this view. Open any lead from your pipeline to schedule a follow-up.
          </p>
        </PageCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '16px' }}>
          {filtered.map((f) => {
            const isOverdue = f.status === 'overdue';
            const isDueToday = f.status === 'due_today';
            const isCompleted = f.status === 'completed';

            return (
              <div
                key={f.id}
                className="rounded-2xl bg-white border border-[#E7EAEE] shadow-xs flex flex-col justify-between transition-all hover:shadow-md"
                style={{
                  padding: '20px 22px',
                  gap: '14px',
                  borderLeft: `4px solid ${
                    isCompleted
                      ? '#10B981'
                      : isOverdue
                      ? '#EF4444'
                      : isDueToday
                      ? '#F59E0B'
                      : '#8B5CF6'
                  }`,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="flex items-center justify-between">
                    <span
                      className="inline-flex items-center rounded-full text-[11px] font-bold"
                      style={{
                        padding: '3px 10px',
                        gap: '5px',
                        backgroundColor: isCompleted
                          ? '#D1FAE5'
                          : isOverdue
                          ? '#FEE2E2'
                          : isDueToday
                          ? '#FEF3C7'
                          : '#F3E8FF',
                        color: isCompleted
                          ? '#065F46'
                          : isOverdue
                          ? '#991B1B'
                          : isDueToday
                          ? '#92400E'
                          : '#6D28D9',
                      }}
                    >
                      <Clock className="w-3 h-3" />
                      <span>
                        {isCompleted
                          ? 'Completed'
                          : isOverdue
                          ? 'OVERDUE'
                          : isDueToday
                          ? 'DUE TODAY'
                          : 'SCHEDULED'}
                      </span>
                    </span>

                    <span className="text-[12px] text-text-muted font-medium tabular-nums">
                      {formatDateTime(f.time)}
                    </span>
                  </div>

                  <h3 className="text-[16px] font-bold text-text-primary line-clamp-1">
                    {f.businessName}
                  </h3>

                  <div className="flex items-center text-xs text-text-secondary font-medium" style={{ gap: '12px' }}>
                    <span>{f.contact}</span>
                    <span>•</span>
                    <a
                      href={`tel:${f.phone}`}
                      className="text-primary-700 hover:underline flex items-center font-bold tabular-nums"
                      style={{ gap: '4px' }}
                    >
                      <Phone className="w-3 h-3" />
                      <span>{f.phone}</span>
                    </a>
                  </div>

                  <div
                    className="rounded-xl bg-[#F8FAFB] border border-[#E7EAEE] text-[12.5px] text-text-secondary leading-relaxed"
                    style={{ padding: '10px 12px' }}
                  >
                    <strong className="text-text-primary font-semibold">Agenda:</strong>{' '}
                    {f.purpose}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#F0F2F5] pt-3" style={{ gap: '10px' }}>
                  {!isCompleted && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markCompleted(f.id, f.businessName)}
                      className="text-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-success" />
                      <span>Mark Done</span>
                    </Button>
                  )}

                  <Button asChild size="sm" className="ml-auto text-xs">
                    <Link href={`/employee/my-leads/${f.leadId}`}>
                      <span>Open Lead & Call</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminPageContainer>
  );
}
