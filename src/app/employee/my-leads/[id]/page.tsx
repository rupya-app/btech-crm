import React from 'react';
import { notFound } from 'next/navigation';
import { LeadDetailView } from '@/components/leads/lead-detail-view';
import { getLeadById, getLeadActivities, getLeadRemarks } from '@/services/leads.service';


export default async function EmployeeLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) {
    notFound();
  }

  const [activities, remarks] = await Promise.all([
    getLeadActivities(id),
    getLeadRemarks(id),
  ]);

  return (
    <LeadDetailView
      lead={lead}
      activities={activities}
      remarks={remarks}
      isAdmin={false}
    />
  );
}
