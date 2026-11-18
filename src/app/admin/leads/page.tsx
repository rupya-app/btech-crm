import React from 'react';
import Link from 'next/link';
import { Briefcase, Upload, UserPlus, Download, Plus } from 'lucide-react';
import { LeadTable } from '@/components/leads/lead-table';
import { getLeads } from '@/services/leads.service';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/utils';


export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    status?: string;
    priority?: string;
    category?: string;
  }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const pageSize = parseInt(params.pageSize || '25', 10);

  const { data: leads, total, totalPages } = await getLeads({
    page,
    pageSize,
    search: params.search,
    status: params.status as any,
    priority: params.priority as any,
    category: params.category,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            All Sales Leads
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Managing <strong className="text-text-primary font-semibold">{formatNumber(total)}</strong> leads across all stages and assignments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            className="text-xs h-9 border-border bg-surface hover:bg-surface-muted"
          >
            <Link href="/admin/reports" className="flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-text-muted" />
              <span>Export</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="text-xs h-9 border-border bg-surface hover:bg-surface-muted"
          >
            <Link href="/admin/assignments" className="flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-text-muted" />
              <span>Assignment</span>
            </Link>
          </Button>

          <Button
            asChild
            className="text-xs h-9 bg-primary-600 hover:bg-primary-700 text-white shadow-xs"
          >
            <Link href="/admin/imports" className="flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              <span>Import Excel / CSV</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Leads Table */}
      <LeadTable
        initialLeads={leads}
        total={total}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        isAdmin={true}
      />
    </div>
  );
}
