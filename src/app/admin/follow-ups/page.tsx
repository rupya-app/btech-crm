'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  User,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';

export default function AdminFollowupsPage() {
  const [filter, setFilter] = useState<'all' | 'due_today' | 'overdue' | 'completed'>('all');

  const [followups, setFollowups] = useState([
    {
      id: 'f-1',
      businessName: 'Apex Logistics & Freight Solutions',
      contact: 'Rajesh Verma',
      phone: '+91 98201 12345',
      time: new Date(Date.now() + 3600000 * 2).toISOString(),
      purpose: 'Product Demo & Pricing Discussion',
      assignedTo: 'Priya Sharma (EMP1001)',
      status: 'due_today',
      leadId: 'b0000000-0000-0000-0000-000000000001',
    },
    {
      id: 'f-2',
      businessName: 'Zenith Precision Engineering',
      contact: 'Karthik Sundaram',
      phone: '+91 98401 22334',
      time: new Date(Date.now() + 3600000 * 4).toISOString(),
      purpose: 'Technical integration review',
      assignedTo: 'Vikram Patel (EMP1002)',
      status: 'due_today',
      leadId: 'b0000000-0000-0000-0000-000000000004',
    },
    {
      id: 'f-3',
      businessName: 'BlueWave Digital Marketing',
      contact: 'Sneha Kapoor',
      phone: '+91 98112 98765',
      time: new Date(Date.now() - 3600000 * 24).toISOString(),
      purpose: 'Budget approval confirmation',
      assignedTo: 'Rahul Varma (EMP1003)',
      status: 'overdue',
      leadId: 'b0000000-0000-0000-0000-000000000002',
    },
    {
      id: 'f-4',
      businessName: 'UrbanCraft Modern Furniture',
      contact: 'Amitabh Saxena',
      phone: '+91 99887 66554',
      time: new Date(Date.now() + 3600000 * 28).toISOString(),
      purpose: 'Contract terms sign-off',
      assignedTo: 'Rahul Varma (EMP1003)',
      status: 'scheduled',
      leadId: 'b0000000-0000-0000-0000-000000000006',
    },
  ]);

  const markCompleted = (id: string) => {
    setFollowups((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'completed' } : f))
    );
  };

  const filtered = followups.filter((f) => {
    if (filter === 'all') return true;
    return f.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Scheduled Follow-ups & Reminders
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Track upcoming sales calls, overdue actions, and customer appointment schedules.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-surface p-1 rounded-xl border border-border shadow-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'due_today', label: 'Due Today' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === tab.id
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of followups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-surface border border-border shadow-xs hover:border-primary-200 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-primary-600" />
                  {formatDateTime(item.time)}
                </span>

                {item.status === 'overdue' && (
                  <span className="text-[10px] font-bold text-danger bg-danger-bg px-2 py-0.5 rounded-full">
                    Overdue
                  </span>
                )}
                {item.status === 'due_today' && (
                  <span className="text-[10px] font-bold text-warning bg-warning-bg px-2 py-0.5 rounded-full">
                    Due Today
                  </span>
                )}
                {item.status === 'completed' && (
                  <span className="text-[10px] font-bold text-success bg-success-bg px-2 py-0.5 rounded-full">
                    Completed
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold text-text-primary mt-1">
                {item.businessName}
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                {item.contact} • {item.phone}
              </p>

              <div className="mt-3 p-3 rounded-xl bg-surface-muted/60 border border-border-light text-xs text-text-secondary italic">
                &ldquo;{item.purpose}&rdquo;
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-text-muted">
                <User className="w-3.5 h-3.5 text-text-muted" />
                <span>Assigned: {item.assignedTo}</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-border-light flex items-center justify-between">
              <a
                href={`tel:${item.phone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Client</span>
              </a>

              <div className="flex items-center gap-2">
                {item.status !== 'completed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markCompleted(item.id)}
                    className="text-xs h-8 text-success hover:bg-success-bg border-success/30"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    <span>Done</span>
                  </Button>
                )}
                <Link
                  href={`/admin/leads/${item.leadId}`}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
