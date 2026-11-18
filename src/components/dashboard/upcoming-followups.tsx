import React from 'react';
import Link from 'next/link';
import { Clock, Phone, Calendar, ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UpcomingFollowups({ isAdmin = true }: { isAdmin?: boolean }) {
  const followups = [
    {
      id: 'f-1',
      businessName: 'Apex Logistics & Freight',
      contact: 'Rajesh Verma',
      phone: '+91 98201 12345',
      time: 'Today, 2:30 PM',
      purpose: 'Product Demo & Pricing Discussion',
      assignedTo: 'Priya Sharma',
      status: 'due_today',
      leadId: 'b0000000-0000-0000-0000-000000000001',
    },
    {
      id: 'f-2',
      businessName: 'Zenith Precision Engineering',
      contact: 'Karthik Sundaram',
      phone: '+91 98401 22334',
      time: 'Today, 4:00 PM',
      purpose: 'Technical integration review',
      assignedTo: 'Vikram Patel',
      status: 'due_today',
      leadId: 'b0000000-0000-0000-0000-000000000004',
    },
    {
      id: 'f-3',
      businessName: 'UrbanCraft Modern Furniture',
      contact: 'Amitabh Saxena',
      phone: '+91 99887 66554',
      time: 'Tomorrow, 11:00 AM',
      purpose: 'Contract terms sign-off',
      assignedTo: 'Rahul Varma',
      status: 'scheduled',
      leadId: 'b0000000-0000-0000-0000-000000000006',
    },
  ];

  return (
    <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Upcoming Follow-ups</h3>
            <p className="text-[11px] text-text-muted">Calls & demos scheduled for today and tomorrow</p>
          </div>
        </div>
        <Link
          href={isAdmin ? '/admin/follow-ups' : '/employee/follow-ups'}
          className="text-xs font-medium text-primary-600 hover:text-primary-700"
        >
          View all
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {followups.map((f) => (
          <div
            key={f.id}
            className="flex flex-col justify-between p-4 rounded-xl border border-border-light bg-surface-muted/50 hover:bg-surface hover:border-primary-200 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full">
                  <Calendar className="w-3 h-3 text-primary-600" />
                  {f.time}
                </span>
                {f.status === 'due_today' && (
                  <span className="text-[10px] font-bold text-warning uppercase">Due Today</span>
                )}
              </div>

              <h4 className="text-xs font-bold text-text-primary group-hover:text-primary-600 truncate">
                {f.businessName}
              </h4>
              <p className="text-[11px] text-text-secondary mt-0.5 truncate">
                {f.contact} • {f.phone}
              </p>
              <p className="text-[11px] text-text-muted mt-2 line-clamp-1 italic">
                &ldquo;{f.purpose}&rdquo;
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-border-light flex items-center justify-between">
              {isAdmin && (
                <div className="flex items-center gap-1 text-[10px] text-text-muted">
                  <User className="w-3 h-3" />
                  <span>{f.assignedTo}</span>
                </div>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <a
                  href={`tel:${f.phone.replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-medium shadow-xs transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call</span>
                </a>
                <Link
                  href={isAdmin ? `/admin/leads/${f.leadId}` : `/employee/my-leads/${f.leadId}`}
                  className="p-1 rounded-lg hover:bg-surface-muted text-text-muted hover:text-text-primary"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
