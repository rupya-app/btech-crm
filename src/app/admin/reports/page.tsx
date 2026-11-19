'use client';

import React, { useState } from 'react';
import {
  Download,
  CheckCircle2,
  FileText,
  FileSpreadsheet,
  Clock,
  Briefcase,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminPageContainer, PageHeader, PageCard, PageCardHeader, SuccessNotice } from '@/components/common';

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState('all_leads');
  const [format, setFormat] = useState('csv');
  const [statusFilter, setStatusFilter] = useState('all');
  const [downloading, setDownloading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setDownloading(true);
    setNotice(null);

    try {
      const res = await fetch('/api/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType, format, status: statusFilter }),
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_export_${Date.now()}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setNotice('Report generated and downloaded successfully. Audit log recorded.');
    } catch (err: any) {
      alert('Failed to generate report');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AdminPageContainer>
      <PageHeader
        title="Reports & Data Export Center"
        description="Export structured lead registries, performance statistics, and telecalling outcomes in Excel (.xlsx) and CSV format."
      />

      {notice && <SuccessNotice message={notice} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Form */}
        <PageCard>
          <PageCardHeader title="Generate Custom Export" icon={Download} />

          <form onSubmit={handleExport} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-text-primary">Report Dataset</label>
              <Select value={reportType} onValueChange={(val) => setReportType(val || 'all_leads')}>
                <SelectTrigger className="text-[13px] h-11 rounded-xl">
                  <SelectValue placeholder="Choose Report" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_leads">All Leads Registry</SelectItem>
                  <SelectItem value="confirmed_leads">Confirmed Deals & Wins</SelectItem>
                  <SelectItem value="interested_leads">Interested Prospects</SelectItem>
                  <SelectItem value="pending_leads">Pending Inquiries</SelectItem>
                  <SelectItem value="unassigned_leads">Unassigned Lead Pool</SelectItem>
                  <SelectItem value="employee_performance">Employee Performance Breakdown</SelectItem>
                  <SelectItem value="call_activities">Call Log & Telecalling Audit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-text-primary">Status Filter</label>
              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'all')}>
                <SelectTrigger className="text-[13px] h-11 rounded-xl">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New Only</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-text-primary">Export Format</label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'csv', label: 'CSV (.csv)', icon: FileText },
                  { id: 'excel', label: 'Excel (.xlsx)', icon: FileSpreadsheet },
                ].map((fmt) => {
                  const Icon = fmt.icon;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setFormat(fmt.id)}
                      className={`p-3 rounded-xl border text-[13px] font-semibold flex items-center justify-center gap-2 transition-all ${
                        format === fmt.id
                          ? 'bg-primary-50 text-primary-700 border-primary-300 shadow-xs'
                          : 'bg-surface-muted text-text-secondary border-border hover:bg-surface'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{fmt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              type="submit"
              disabled={downloading}
              className="w-full text-[13px] font-semibold bg-primary-600 hover:bg-primary-700 text-white h-11 mt-3 rounded-xl shadow-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              <span>{downloading ? 'Compiling Dataset...' : 'Download Export File'}</span>
            </Button>
          </form>
        </PageCard>

        {/* Quick Download Cards */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-[15px] font-semibold text-text-primary">
            Standard System Reports
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                title: 'Full Leads Database',
                desc: 'All active and archived records with normalized phone numbers and address info.',
                icon: Briefcase,
                type: 'all_leads',
              },
              {
                title: 'Won Deals Report',
                desc: 'Confirmed leads with confirmation timestamps, notes, and closing sales rep.',
                icon: CheckCircle2,
                type: 'confirmed_leads',
              },
              {
                title: 'Employee Performance Summary',
                desc: 'Sales rep rankings, conversion rates, contact rates, and total calls made.',
                icon: Users,
                type: 'employee_performance',
              },
              {
                title: 'Telecalling Audit Trail',
                desc: 'Every call outcome, duration in seconds, remarks, and agent details.',
                icon: Clock,
                type: 'call_activities',
              },
            ].map((rep, idx) => {
              const Icon = rep.icon;
              return (
                <PageCard key={idx} hover className="flex flex-col justify-between min-h-[180px]">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-3.5 shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-text-primary">{rep.title}</h3>
                    <p className="text-[13px] text-text-muted mt-1 leading-relaxed">{rep.desc}</p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-border-light flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setReportType(rep.type);
                        setNotice(`Ready to export "${rep.title}". Click Download Export File.`);
                      }}
                      className="text-[13px] h-9 px-4 rounded-xl text-primary-700 hover:bg-primary-50 border-primary-200 font-semibold"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      <span>Select Report</span>
                    </Button>
                  </div>
                </PageCard>
              );
            })}
          </div>
        </div>
      </div>
    </AdminPageContainer>
  );
}
