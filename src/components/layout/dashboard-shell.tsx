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
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar sections={sections} role={role} />
      
      {/* Dynamic margin matching sidebar width */}
      <div
        className={cn(
          'flex flex-col flex-1 transition-[margin] duration-200 ease-in-out',
          isCollapsed ? 'md:ml-[76px]' : 'md:ml-[248px]'
        )}
      >
        <Topbar user={user} notifications={notifications} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto animate-in fade-in-50 duration-200">
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
