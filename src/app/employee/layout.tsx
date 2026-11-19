import React from 'react';
import { cookies } from 'next/headers';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: {
    id: string;
    fullName: string;
    email: string;
    employeeId: string;
    role: 'employee';
    avatarUrl?: string;
  } = {
    id: 'emp-default',
    fullName: 'Sales Executive',
    email: 'employee@digitalcrm.com',
    employeeId: 'EMP1001',
    role: 'employee' as const,
  };

  try {
    const cookieStore = await cookies();
    const cached = cookieStore.get('crm_profile')?.value;
    if (cached) {
      const parsed = JSON.parse(decodeURIComponent(cached));
      if (parsed?.id) {
        user = {
          id: parsed.id,
          fullName: parsed.fullName || 'Sales Executive',
          email: parsed.email || 'employee@digitalcrm.com',
          employeeId: parsed.employeeId || 'EMP1001',
          role: 'employee',
        };
      }
    }
  } catch {}

  return (
    <DashboardShell role="employee" user={user}>
      {children}
    </DashboardShell>
  );
}
