import React from 'react';
import Link from 'next/link';
import { Upload, UserPlus, Download } from 'lucide-react';
import { LeadTable } from '@/components/leads/lead-table';
import { getStageMeta } from '@/components/common/stage-meta';
import { getLeads, getLeadStatusCounts } from '@/services/leads.service';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/utils';
import { AdminPageContainer } from '@/components/common/admin-page-container';
import { PageHeader } from '@/components/common/page-header';

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

  const [{ data: leads, total, totalPages }, statusCounts] = await Promise.all([
    getLeads({
      page,
      pageSize,
      search: params.search,
      status: params.status as any,
      priority: params.priority as any,
      category: params.category,
    }),
    getLeadStatusCounts(),
  ]);

  const activeStage = getStageMeta(params.status);
  const activeCount = statusCounts[activeStage.countKey] ?? total;

  return (
    <AdminPageContainer>
      <PageHeader
        title={activeStage.pageTitle}
        badge={
          <span
            className="inline-flex items-center rounded-full text-xs font-bold tracking-wide"
            style={{
              padding: '4px 12px',
              gap: '7px',
              backgroundColor: activeStage.theme.activeBg,
              color: activeStage.theme.activeText,
              border: `1px solid ${activeStage.theme.activeBorder}`,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: activeStage.theme.dot }}
            />
            <span>Pipeline Stage • {activeStage.label}</span>
          </span>
        }
        description={
          <>
            {activeStage.pageDescription} Showing{' '}
            <strong className="text-text-primary font-semibold">
              {formatNumber(activeCount)}
            </strong>{' '}
            records in this stage.
          </>
        }
        actions={
          <>
            <Button
              asChild
              variant="outline"
              className="text-[13px] h-10 px-4 rounded-xl border-border bg-white hover:bg-[#F8FAFB] font-medium shadow-2xs"
              style={{ padding: '0 16px', height: '40px' }}
            >
              <Link href="/admin/reports" className="flex items-center gap-2" style={{ gap: '8px' }}>
                <Download className="w-4 h-4 text-text-muted" />
                <span>Export Data</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="text-[13px] h-10 px-4 rounded-xl border-border bg-white hover:bg-[#F8FAFB] font-medium shadow-2xs"
              style={{ padding: '0 16px', height: '40px' }}
            >
              <Link href="/admin/assignments" className="flex items-center gap-2" style={{ gap: '8px' }}>
                <UserPlus className="w-4 h-4 text-text-muted" />
                <span>Distribute Leads</span>
              </Link>
            </Button>

            <Button
              asChild
              className="text-[13px] h-10 px-5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-xs font-semibold"
              style={{ padding: '0 18px', height: '40px' }}
            >
              <Link href="/admin/imports" className="flex items-center gap-2" style={{ gap: '8px' }}>
                <Upload className="w-4 h-4" />
                <span>Import Excel / CSV</span>
              </Link>
            </Button>
          </>
        }
      />

      {/* Leads Table Component with Color-Coded Stage Tabs */}
      <LeadTable
        initialLeads={leads}
        total={total}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        statusCounts={statusCounts}
        isAdmin={true}
      />
    </AdminPageContainer>
  );
}
