import React from 'react';
import { Activity, Phone, CheckCircle2, UserPlus, Clock, Upload, Filter } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function AdminActivityLogsPage() {
  const logs = [
    {
      id: 'log-1',
      actor: 'Priya Sharma (EMP1001)',
      action: 'Call Outcome Recorded',
      details: 'Recorded "Connected" for Apex Logistics. Remark: "Pricing proposal requested for 85 vehicles."',
      entity: 'Lead #10001',
      time: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      icon: Phone,
      color: 'text-primary-600 bg-primary-50',
    },
    {
      id: 'log-2',
      actor: 'Main Administrator',
      action: 'Leads Assigned in Bulk',
      details: 'Allocated 50 unassigned leads to Priya Sharma and Vikram Patel via Workload Balance.',
      entity: 'Lead Batch #24',
      time: new Date(Date.now() - 3600000 * 3.5).toISOString(),
      icon: UserPlus,
      color: 'text-accent-blue bg-accent-blueSoft',
    },
    {
      id: 'log-3',
      actor: 'Vikram Patel (EMP1002)',
      action: 'Lead Confirmed (Won Deal)',
      details: 'Vanguard Healthtech Labs confirmed annual contract. Value recorded.',
      entity: 'Lead #10003',
      time: new Date(Date.now() - 3600000 * 8).toISOString(),
      icon: CheckCircle2,
      color: 'text-success bg-success-bg',
    },
    {
      id: 'log-4',
      actor: 'Main Administrator',
      action: 'Excel Batch Upload Completed',
      details: 'Ingested 15,400 rows from "Q1_Maharashtra_Gujarat_B2B_Leads.xlsx". 14,850 successful.',
      entity: 'Import Job #1',
      time: new Date(Date.now() - 3600000 * 24).toISOString(),
      icon: Upload,
      color: 'text-warning bg-warning-bg',
    },
    {
      id: 'log-5',
      actor: 'Rahul Varma (EMP1003)',
      action: 'Follow-up Scheduled',
      details: 'Follow-up scheduled with Amitabh Saxena (UrbanCraft Modern Furniture) for tomorrow 11 AM.',
      entity: 'Lead #10006',
      time: new Date(Date.now() - 3600000 * 30).toISOString(),
      icon: Clock,
      color: 'text-primary-600 bg-primary-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          System Activity & Audit Logs
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Immutable event stream capturing administrative actions, call records, status transitions, and data operations.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-muted border-b border-border text-text-secondary font-semibold">
              <tr>
                <th className="py-3 px-4">Event & Action</th>
                <th className="py-3 px-3">Actor / Employee</th>
                <th className="py-3 px-3">Target Entity</th>
                <th className="py-3 px-3">Event Details</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {logs.map((l) => {
                const Icon = l.icon;
                return (
                  <tr key={l.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg shrink-0 ${l.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-text-primary">{l.action}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-text-secondary">{l.actor}</td>
                    <td className="py-3.5 px-3 font-semibold text-primary-700">{l.entity}</td>
                    <td className="py-3.5 px-3 text-text-secondary max-w-md">{l.details}</td>
                    <td className="py-3.5 px-4 text-right tabular-nums text-text-muted">
                      {formatDateTime(l.time)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
