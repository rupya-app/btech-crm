import React from 'react';
import { getLeads } from '@/services/leads.service';
import { LeadTable } from '@/components/leads/lead-table';


export default async function EmployeeConfirmedLeadsPage() {
  const { data: leads, total, totalPages } = await getLeads({
    status: 'confirmed',
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Confirmed Wins & Deals
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Review your closed deals and client onboarding milestones.
        </p>
      </div>

      <LeadTable
        initialLeads={leads}
        total={total}
        page={1}
        pageSize={25}
        totalPages={totalPages}
        isAdmin={false}
      />
    </div>
  );
}
