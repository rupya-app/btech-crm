import React from 'react';
import Link from 'next/link';
import { Briefcase, Layers, Phone } from 'lucide-react';
import { LeadTable } from '@/components/leads/lead-table';
import { getLeads } from '@/services/leads.service';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/utils';


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

  const { data: leads, total, totalPages } = await getLeads({
    page,
    pageSize,
    search: params.search,
    status: params.status as any,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            My Assigned Leads
          </h1>
          <p className="text-xs text-text-muted mt-1">
            You currently have <strong className="text-text-primary font-semibold">{formatNumber(total)}</strong> leads assigned to your active queue
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            className="text-xs h-9 border-border bg-surface hover:bg-surface-muted"
          >
            <Link href="/employee/lead-pool" className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-text-muted" />
              <span>Browse Available Pool</span>
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
        isAdmin={false}
      />
    </div>
  );
}
