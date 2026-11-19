'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Bell,
  Menu,
  User,
  LogOut,
  Settings,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { useSidebar } from './sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface TopbarProps {
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

export function Topbar({
  user = {
    id: '1',
    fullName: 'Administrator',
    email: 'admin@digitalcrm.com',
    employeeId: 'ADM001',
    role: 'admin',
  },
  notifications = [],
}: TopbarProps) {
  const { setMobileOpen } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(notifications);

  React.useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        if (Array.isArray(data.notifications)) {
          setUnreadNotifications(data.notifications);
        }
      } catch {}
    };
    loadNotifications();
    const timer = setInterval(loadNotifications, 60000);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = unreadNotifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = async () => {
    setUnreadNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
    } catch {}
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      window.location.href = '/login';
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const searchTarget = user.role === 'admin' ? '/admin/leads' : '/employee/my-leads';
    router.push(`${searchTarget}?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, idx) => {
    const url = `/${pathSegments.slice(0, idx + 1).join('/')}`;
    const formatted = segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return { label: formatted, url };
  });

  return (
    <header
      className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-white px-6 lg:px-9 shadow-2xs transition-all"
      style={{ height: '64px', padding: '0 32px' }}
    >
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3 shrink-0" style={{ gap: '12px' }}>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-text-secondary hover:text-text-primary h-9 w-9"
          onClick={() => setMobileOpen(true)}
          aria-label="Open mobile menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="hidden sm:flex items-center gap-2 text-[13px] text-text-muted"
          style={{ gap: '8px' }}
        >
          <Link
            href={user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard'}
            className="font-medium text-text-secondary hover:text-primary-600 transition-colors"
          >
            {user.role === 'admin' ? 'Admin' : 'Workspace'}
          </Link>
          {breadcrumbs.slice(1).map((crumb, idx) => (
            <React.Fragment key={crumb.url}>
              <ChevronRight className="h-3.5 w-3.5 text-text-muted/60" />
              {idx === breadcrumbs.length - 2 ? (
                <span className="font-semibold text-text-primary">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.url}
                  className="hover:text-primary-600 transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Center: Global Search (Flex layout prevents icon/text overlap) */}
      <div className="hidden md:flex flex-1 max-w-md mx-8" style={{ margin: '0 24px' }}>
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-3 w-full h-10.5 rounded-xl border border-border bg-[#F8FAFB] px-3.5 focus-within:border-primary-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-500/15 transition-all shadow-2xs"
          style={{ padding: '0 14px', gap: '10px', height: '42px' }}
        >
          <Search className="h-4 w-4 text-text-muted shrink-0" />
          <input
            type="search"
            placeholder={
              user.role === 'admin'
                ? 'Search leads, businesses, phone, email, contact...'
                : 'Search my assigned leads...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-full bg-transparent text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </form>
      </div>

      {/* Right: Actions, Notifications, Profile */}
      <div className="flex items-center gap-3" style={{ gap: '12px' }}>
        {/* Status Indicator Pill */}
        <div
          className="hidden lg:flex items-center gap-2 rounded-full bg-primary-50 border border-primary-200/70 px-3 py-1 text-[12px] font-semibold text-primary-700"
          style={{ padding: '4px 12px', gap: '6px' }}
        >
          <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
          <span>Live CRM</span>
        </div>

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full text-text-secondary hover:bg-surface-muted hover:text-text-primary h-9 w-9"
              aria-label="View notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-danger" />
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 shadow-lg border-border">
            <div
              className="flex items-center justify-between border-b border-border-light px-4 py-3"
              style={{ padding: '12px 16px' }}
            >
              <span className="text-xs font-semibold text-text-primary">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-border-light">
              {unreadNotifications.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center p-6 text-center text-xs text-text-muted"
                  style={{ padding: '24px' }}
                >
                  <CheckCircle2 className="h-8 w-8 text-primary-400 mb-2" />
                  <p className="font-medium text-text-secondary">You&apos;re all caught up</p>
                  <p className="text-[11px]">No pending notifications</p>
                </div>
              ) : (
                unreadNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 text-xs transition-colors hover:bg-surface-muted ${
                      !n.is_read ? 'bg-primary-50/40' : ''
                    }`}
                    style={{ padding: '14px' }}
                  >
                    <p className="font-medium text-text-primary">{n.title}</p>
                    <p className="text-[11px] text-text-secondary mt-0.5">{n.message}</p>
                    <span className="text-[10px] text-text-muted mt-1 block">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-full hover:bg-surface-muted transition-colors h-auto"
              style={{ padding: '6px 10px', gap: '10px' }}
            >
              <Avatar className="h-8 w-8 border border-border">
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.fullName} />}
                <AvatarFallback className="bg-primary-100 text-primary-700 text-xs font-semibold">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden xl:flex flex-col items-start text-left">
                <span className="text-xs font-semibold text-text-primary leading-tight">
                  {user.fullName}
                </span>
                <span className="text-[10px] text-text-muted uppercase tracking-wider">
                  {user.role === 'admin' ? 'Administrator' : user.employeeId}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 shadow-lg border-border">
            <DropdownMenuLabel className="font-normal p-3" style={{ padding: '12px' }}>
              <div className="flex flex-col space-y-1">
                <p className="text-xs font-semibold text-text-primary leading-none">
                  {user.fullName}
                </p>
                <p className="text-[11px] text-text-muted leading-none">
                  {user.email}
                </p>
                <div className="pt-1.5 flex items-center gap-1.5">
                  <span
                    className="inline-flex items-center rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-medium text-primary-800"
                    style={{ padding: '2px 8px' }}
                  >
                    {user.role === 'admin' ? 'Super Admin' : `ID: ${user.employeeId}`}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="text-xs cursor-pointer">
              <Link href={user.role === 'admin' ? '/admin/settings' : '/employee/profile'} className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-text-muted" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>
            {user.role === 'admin' && (
              <DropdownMenuItem asChild className="text-xs cursor-pointer">
                <Link href="/admin/settings" className="flex items-center gap-2">
                  <Settings className="h-3.5 w-3.5 text-text-muted" />
                  <span>CRM Settings</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-xs text-danger focus:text-danger cursor-pointer flex items-center gap-2"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
