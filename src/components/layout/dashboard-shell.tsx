'use client';

import React from 'react';
import { SidebarProvider, useSidebar, Sidebar, adminNavSections, employeeNavSections } from './sidebar';
import { Topbar } from './topbar';
import { cn } from '@/lib/utils';

interface DashboardShellProps {
  children: React.ReactNode;
  role: 'admin' | 'employee';
  user?: {
    id: string;
    fullName: string;
    email: string;
    employeeId: string;
    role: 'admin' | 'employee';
    avatarUrl?: string;
  };
  notifications?: Array<{
    id: string;
    title: string;
    message: string;
    created_at: string;
    is_read: boolean;
  }>;
}

function MainContent({
  children,
  user,
  notifications,
  role,
}: {
  children: React.ReactNode;
  user?: DashboardShellProps['user'];
  notifications?: DashboardShellProps['notifications'];
  role: 'admin' | 'employee';
}) {
  const { isCollapsed } = useSidebar();
  const sections = role === 'admin' ? adminNavSections : employeeNavSections;

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col w-full">
      <Sidebar sections={sections} role={role} />

      {/* Dynamic margin offset guaranteeing zero overlap and zero horizontal overflow */}
      <div
        className={cn(
          'app-main-layout flex flex-col flex-1 min-w-0',
          isCollapsed && 'collapsed'
        )}
      >
        <Topbar user={user} notifications={notifications} />

        {/* Modern SaaS Main Workspace: 36px horizontal padding, 32px vertical padding */}
        <main
          className="flex-1 w-full min-w-0 px-6 py-7 sm:px-8 sm:py-8 lg:px-9 lg:py-8 box-border overflow-x-hidden"
          style={{ padding: '32px 36px' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export function DashboardShell({ children, role, user, notifications }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <MainContent user={user} notifications={notifications} role={role}>
        {children}
      </MainContent>
    </SidebarProvider>
  );
}
