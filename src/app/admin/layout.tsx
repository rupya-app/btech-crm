import React from 'react';
import { cookies } from 'next/headers';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: {
    id: string;
    fullName: string;
    email: string;
    employeeId: string;
    role: 'admin';
    avatarUrl?: string;
  } = {
    id: 'admin-default',
    fullName: 'Main Administrator',
    email: 'admin@digitalcrm.com',
    employeeId: 'ADM001',
    role: 'admin' as const,
  };

  try {
    const cookieStore = await cookies();
    const cached = cookieStore.get('crm_profile')?.value;
    if (cached) {
      const parsed = JSON.parse(decodeURIComponent(cached));
      if (parsed?.id) {
        user = {
          id: parsed.id,
          fullName: parsed.fullName || 'Main Administrator',
          email: parsed.email || 'admin@digitalcrm.com',
          employeeId: parsed.employeeId || 'ADM001',
          role: 'admin',
        };
      }
    }
  } catch {}

  return (
    <DashboardShell role="admin" user={user}>
      {children}
    </DashboardShell>
  );
}
