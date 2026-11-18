import React from 'react';
import Link from 'next/link';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Clock, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate, formatDateTime, formatNumber } from '@/lib/utils';

export default function ImportHistoryPage() {
  const history = [
    {
      id: 'job-1',
      filename: 'Q1_Maharashtra_Gujarat_B2B_Leads.xlsx',
      uploaded_by: 'Main Administrator',
      total_rows: 15400,
      successful_rows: 14850,
      duplicate_rows: 420,
      failed_rows: 130,
      status: 'completed',
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
    {
      id: 'job-2',
      filename: 'South_India_Industrial_Directory.csv',
      uploaded_by: 'Main Administrator',
      total_rows: 8200,
      successful_rows: 7920,
      duplicate_rows: 210,
      failed_rows: 70,
      status: 'completed',
      created_at: new Date(Date.now() - 3600000 * 120).toISOString(),
    },
    {
      id: 'job-3',
      filename: 'Pharma_Healthcare_Leads_Batch3.xlsx',
      uploaded_by: 'Main Administrator',
      total_rows: 5600,
      successful_rows: 5540,
      duplicate_rows: 45,
      failed_rows: 15,
      status: 'completed',
      created_at: new Date(Date.now() - 3600000 * 240).toISOString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Dataset Import History
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Complete audit trail of uploaded spreadsheets, ingestion logs, duplicates, and batch processing status.
          </p>
        </div>

        <Button asChild className="text-xs h-9 bg-primary-600 hover:bg-primary-700 text-white">
          <Link href="/admin/imports" className="flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            <span>New Import</span>
          </Link>
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-muted border-b border-border text-text-secondary font-semibold">
              <tr>
                <th className="py-3 px-4">Filename</th>
                <th className="py-3 px-3">Uploaded By</th>
                <th className="py-3 px-3 text-center">Total Rows</th>
                <th className="py-3 px-3 text-center">Imported</th>
                <th className="py-3 px-3 text-center">Duplicates</th>
                <th className="py-3 px-3 text-center">Rejected</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-4 text-right">Error Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-text-primary flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-primary-600 shrink-0" />
                    <span>{item.filename}</span>
                  </td>
                  <td className="py-3.5 px-3 text-text-secondary">{item.uploaded_by}</td>
                  <td className="py-3.5 px-3 text-center tabular-nums font-semibold text-text-primary">
                    {formatNumber(item.total_rows)}
                  </td>
                  <td className="py-3.5 px-3 text-center tabular-nums text-success font-semibold">
                    {formatNumber(item.successful_rows)}
                  </td>
                  <td className="py-3.5 px-3 text-center tabular-nums text-warning font-semibold">
                    {formatNumber(item.duplicate_rows)}
                  </td>
                  <td className="py-3.5 px-3 text-center tabular-nums text-danger font-semibold">
                    {formatNumber(item.failed_rows)}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-bg text-success text-[11px] font-semibold border border-success/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-text-muted tabular-nums">
                    {formatDateTime(item.created_at)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 text-text-secondary hover:text-text-primary"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      <span>Rejects CSV</span>
                    </Button>
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
