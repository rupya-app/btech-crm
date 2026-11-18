import React from 'react';
import Link from 'next/link';
import { Phone, CheckCircle2, Clock, Calendar, ArrowRight } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function EmployeeCallHistoryPage() {
  const calls = [
    {
      id: 'c-1',
      businessName: 'Apex Logistics & Freight Solutions',
      contact: 'Rajesh Verma',
      phone: '+91 98201 12345',
      time: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      duration: '4m 12s',
      outcome: 'Connected / Pitch Completed',
      remark: 'Requested pricing quotation for 85 vehicles.',
      leadId: 'b0000000-0000-0000-0000-000000000001',
    },
    {
      id: 'c-2',
      businessName: 'BlueWave Digital Marketing',
      contact: 'Sneha Kapoor',
      phone: '+91 98112 98765',
      time: new Date(Date.now() - 3600000 * 3.2).toISOString(),
      duration: '1m 45s',
      outcome: 'Call Back Requested',
      remark: 'Meeting in progress, call after 4 PM.',
      leadId: 'b0000000-0000-0000-0000-000000000002',
    },
    {
      id: 'c-3',
      businessName: 'Zenith Precision Engineering',
      contact: 'Karthik Sundaram',
      phone: '+91 98401 22334',
      time: new Date(Date.now() - 3600000 * 4.8).toISOString(),
      duration: '0m 30s',
      outcome: 'Busy Line',
      remark: 'Auto busy tone.',
      leadId: 'b0000000-0000-0000-0000-000000000004',
    },
    {
      id: 'c-4',
      businessName: 'UrbanCraft Modern Furniture',
      contact: 'Amitabh Saxena',
      phone: '+91 99887 66554',
      time: new Date(Date.now() - 3600000 * 6.5).toISOString(),
      duration: '6m 20s',
      outcome: 'Connected / Demo Scheduled',
      remark: 'Demo booked for tomorrow 11 AM.',
      leadId: 'b0000000-0000-0000-0000-000000000006',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Telecalling Log & History
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Chronological record of all outbound calls, durations, and recorded customer responses.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-muted border-b border-border text-text-secondary font-semibold">
              <tr>
                <th className="py-3 px-4">Business & Contact</th>
                <th className="py-3 px-3">Phone</th>
                <th className="py-3 px-3">Outcome</th>
                <th className="py-3 px-3 text-center">Duration</th>
                <th className="py-3 px-3">Call Time</th>
                <th className="py-3 px-3">Remark</th>
                <th className="py-3 px-4 text-right">Lead</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {calls.map((c) => (
                <tr key={c.id} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-text-primary">{c.businessName}</span>
                      <span className="text-[11px] text-text-muted">{c.contact}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 tabular-nums text-text-secondary">{c.phone}</td>
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 font-semibold text-[11px] border border-primary-200">
                      <Phone className="w-3 h-3" />
                      {c.outcome}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center tabular-nums text-text-secondary font-medium">
                    {c.duration}
                  </td>
                  <td className="py-3.5 px-3 text-text-muted tabular-nums">
                    {formatDateTime(c.time)}
                  </td>
                  <td className="py-3.5 px-3 text-text-secondary italic max-w-xs truncate">
                    &ldquo;{c.remark}&rdquo;
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/employee/my-leads/${c.leadId}`}
                      className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 inline-flex items-center"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
