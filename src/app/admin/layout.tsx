import React from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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
          fullName: profile.full_name || 'Admin',
          email: profile.email || authUser.email || '',
          employeeId: profile.employee_id || 'ADM001',
          role: 'admin',
          avatarUrl: profile.avatar_url || undefined,
        };
      }
    }
  } catch (err) {
    // Graceful fallback for local development or when Supabase keys are not set yet
  }

  return (
    <DashboardShell role="admin" user={user}>
      {children}
    </DashboardShell>
  );
}
