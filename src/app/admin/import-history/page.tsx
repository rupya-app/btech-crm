import React from 'react';
import Link from 'next/link';
import { Upload, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateTime, formatNumber } from '@/lib/utils';
import { getDbClient } from '@/lib/supabase/server';
import { AdminPageContainer, PageHeader, DataTable, DataTableRow, DataTableCell } from '@/components/common';

export const dynamic = 'force-dynamic';

export default async function ImportHistoryPage() {
  const supabase = await getDbClient();
  const { data: jobs } = await supabase
    .from('import_jobs')
    .select('*, uploader:profiles(full_name, employee_id)')
    .order('created_at', { ascending: false });

  const history = jobs || [];

  return (
    <AdminPageContainer>
      <PageHeader
        title="Dataset Import History"
        description="Complete audit trail of uploaded spreadsheets, ingestion logs, duplicates, and batch processing status."
        actions={
          <Button asChild>
            <Link href="/admin/imports" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>New Import</span>
            </Link>
          </Button>
        }
      />

      <DataTable
        headers={[
          { label: 'Filename' },
          { label: 'Uploaded By' },
          { label: 'Total Rows', align: 'center' },
          { label: 'Imported', align: 'center' },
          { label: 'Duplicates', align: 'center' },
          { label: 'Rejected', align: 'center' },
          { label: 'Status' },
          { label: 'Date' },
        ]}
        isEmpty={history.length === 0}
        emptyState={
          <div className="space-y-3 py-4">
            <FileSpreadsheet className="w-10 h-10 text-text-muted/50 mx-auto" />
            <p className="text-[14px] font-semibold text-text-primary">No spreadsheet imports recorded yet</p>
            <p className="text-[13px] text-text-muted">Upload an Excel or CSV file to populate leads and track batch history.</p>
          </div>
        }
      >
        {history.map((item: any) => (
          <DataTableRow key={item.id}>
            <DataTableCell className="font-semibold text-text-primary">
              <div className="flex items-center gap-2.5" style={{ gap: '10px' }}>
                <FileSpreadsheet className="w-4 h-4 text-primary-600 shrink-0" />
                <span>{item.filename}</span>
              </div>
            </DataTableCell>
            <DataTableCell className="text-text-secondary font-medium">
              {item.uploader?.full_name || 'Main Administrator'}
            </DataTableCell>
            <DataTableCell align="center" className="tabular-nums font-semibold text-text-primary">
              {formatNumber(item.total_rows)}
            </DataTableCell>
            <DataTableCell align="center" className="tabular-nums text-success font-semibold">
              {formatNumber(item.successful_rows)}
            </DataTableCell>
            <DataTableCell align="center" className="tabular-nums text-warning font-semibold">
              {formatNumber(item.duplicate_rows)}
            </DataTableCell>
            <DataTableCell align="center" className="tabular-nums text-danger font-semibold">
              {formatNumber(item.failed_rows)}
            </DataTableCell>
            <DataTableCell>
              <span
                className="inline-flex items-center rounded-full bg-success-bg text-success text-xs font-semibold border border-success/30"
                style={{ padding: '3px 10px', gap: '5px' }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="capitalize">{item.status || 'Completed'}</span>
              </span>
            </DataTableCell>
            <DataTableCell className="text-text-muted tabular-nums whitespace-nowrap">
              {formatDateTime(item.created_at)}
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTable>
    </AdminPageContainer>
  );
}
