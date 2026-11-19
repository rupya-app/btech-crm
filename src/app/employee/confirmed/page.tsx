import React from 'react';
import { AdminPageContainer, PageHeader } from '@/components/common';
import { getLeads, getLeadStatusCounts, getCurrentUserId } from '@/services/leads.service';
import { LeadTable } from '@/components/leads/lead-table';

export const dynamic = 'force-dynamic';

export default async function EmployeeConfirmedLeadsPage() {
  const employeeId = await getCurrentUserId();
  const [{ data: leads, total, totalPages }, statusCounts] = await Promise.all([
    getLeads({
      status: 'confirmed',
      employeeId: employeeId || undefined,
    }),
    getLeadStatusCounts(employeeId || undefined),
  ]);

  return (
    <AdminPageContainer>
      <PageHeader
        title="Confirmed Wins & Deals"
        description="Review your closed deals and client onboarding milestones."
      />

      <LeadTable
        initialLeads={leads}
        total={total}
        page={1}
        pageSize={25}
        totalPages={totalPages}
        statusCounts={statusCounts}
        isAdmin={false}
      />
    </AdminPageContainer>
  );
}
