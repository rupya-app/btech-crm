import React from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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
    const supabase = await createServerSupabaseClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        user = {
          id: profile.id,
          fullName: profile.full_name || 'Employee',
          email: profile.email || authUser.email || '',
          employeeId: profile.employee_id || 'EMP1001',
          role: 'employee',
          avatarUrl: profile.avatar_url || undefined,
        };
      }
    }
  } catch (err) {
    // Graceful fallback for local development or when Supabase keys are not set yet
  }

  return (
    <DashboardShell role="employee" user={user}>
      {children}
    </DashboardShell>
  );
}
