import React from 'react';
import Link from 'next/link';
import { Layers } from 'lucide-react';
import { AdminPageContainer, PageHeader } from '@/components/common';
import { getStageMeta } from '@/components/common/stage-meta';
import { LeadTable } from '@/components/leads/lead-table';
import { getLeads, getLeadStatusCounts, getCurrentUserId } from '@/services/leads.service';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function EmployeeMyLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const pageSize = parseInt(params.pageSize || '25', 10);
  const employeeId = await getCurrentUserId();

  const [{ data: leads, total, totalPages }, statusCounts] = await Promise.all([
    getLeads({
      page,
      pageSize,
      search: params.search,
      status: params.status as any,
      employeeId: employeeId || undefined,
    }),
    getLeadStatusCounts(employeeId || undefined),
  ]);

  const activeStage = getStageMeta(params.status);
  const activeCount = statusCounts[activeStage.countKey] ?? total;

  return (
    <AdminPageContainer>
      <PageHeader
        title={params.status ? activeStage.pageTitle : 'My Assigned Leads'}
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
            <span>My Pipeline • {activeStage.label}</span>
          </span>
        }
        description={`You currently have ${formatNumber(activeCount)} leads in this pipeline stage.`}
        actions={
          <Button
            asChild
            variant="outline"
            className="text-[13px] h-10 px-4 rounded-xl border-border bg-surface hover:bg-surface-muted font-medium shadow-xs"
            style={{ padding: '0 16px', height: '40px' }}
          >
            <Link href="/employee/lead-pool" className="flex items-center gap-2" style={{ gap: '8px' }}>
              <Layers className="w-4 h-4 text-text-muted" />
              <span>Browse Unassigned Pool</span>
            </Link>
          </Button>
        }
      />

      {/* Leads Table */}
      <LeadTable
        initialLeads={leads}
        total={total}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        statusCounts={statusCounts}
        isAdmin={false}
      />
    </AdminPageContainer>
  );
}
