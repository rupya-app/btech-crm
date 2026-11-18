'use client';

import React, { useState, createContext, useContext, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  UserPlus,
  BarChart3,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  Archive,
  Phone,
  Star,
  Target,
  Upload,
  History,
  Download,
  UserCog,
  Activity,
  Bell,
  Tag,
  Layers,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// ============================================================
// SIDEBAR CONTEXT
// ============================================================

interface SidebarContextType {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggle: () => void;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  isMobileOpen: false,
  toggle: () => {},
  setMobileOpen: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggle = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  // Close mobile sidebar on route change
  const pathname = usePathname();
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <SidebarContext.Provider value={{ isCollapsed, isMobileOpen, toggle, setMobileOpen: setIsMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

// ============================================================
// NAV ITEMS CONFIG
// ============================================================

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const adminNavSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Lead Management',
    items: [
      { label: 'All Leads', href: '/admin/leads', icon: Briefcase },
      { label: 'Unassigned Pool', href: '/admin/leads?status=unassigned', icon: Layers },
      { label: 'New Leads', href: '/admin/leads?status=new', icon: Star },
      { label: 'Contacted', href: '/admin/leads?status=contacted', icon: Phone },
      { label: 'Interested', href: '/admin/leads?status=interested', icon: TrendingUp },
      { label: 'Follow-ups', href: '/admin/follow-ups', icon: Clock },
      { label: 'Pending', href: '/admin/leads?status=pending', icon: AlertCircle },
      { label: 'Confirmed', href: '/admin/leads?status=confirmed', icon: CheckCircle2 },
      { label: 'Not Interested', href: '/admin/leads?status=not_interested', icon: Target },
      { label: 'Invalid', href: '/admin/leads?status=unqualified', icon: AlertCircle },
      { label: 'Archived', href: '/admin/leads?status=archived', icon: Archive },
    ],
  },
  {
    title: 'Data Management',
    items: [
      { label: 'Import Excel / CSV', href: '/admin/imports', icon: Upload },
      { label: 'Import History', href: '/admin/import-history', icon: History },
      { label: 'Export Data', href: '/admin/reports', icon: Download },
    ],
  },
  {
    title: 'Organization',
    items: [
      { label: 'Employees', href: '/admin/employees', icon: Users },
      { label: 'Lead Assignment', href: '/admin/assignments', icon: UserPlus },
      { label: 'Performance', href: '/admin/analytics', icon: BarChart3 },
      { label: 'Reports', href: '/admin/reports', icon: FileText },
      { label: 'Activity Logs', href: '/admin/activity-logs', icon: Activity },
    ],
  },
  {
    title: 'Settings',
    items: [
      { label: 'CRM Settings', href: '/admin/settings', icon: Settings },
      { label: 'Notifications', href: '/admin/settings?tab=notifications', icon: Bell },
    ],
  },
];

export const employeeNavSections: NavSection[] = [
  {
    title: '',
    items: [
      { label: 'My Dashboard', href: '/employee/dashboard', icon: LayoutDashboard },
      { label: 'My Leads', href: '/employee/my-leads', icon: Briefcase },
      { label: 'Available Leads', href: '/employee/lead-pool', icon: Layers },
      { label: 'Follow-ups', href: '/employee/follow-ups', icon: Clock },
      { label: 'Call History', href: '/employee/call-history', icon: Phone },
      { label: 'Confirmed', href: '/employee/confirmed', icon: CheckCircle2 },
      { label: 'My Performance', href: '/employee/performance', icon: BarChart3 },
      { label: 'My Profile', href: '/employee/profile', icon: UserCog },
    ],
  },
];

// ============================================================
// SIDEBAR COMPONENT
// ============================================================

interface SidebarProps {
  sections: NavSection[];
  role: 'admin' | 'employee';
}

export function Sidebar({ sections, role }: SidebarProps) {
  const { isCollapsed, isMobileOpen, toggle, setMobileOpen } = useSidebar();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href.includes('?')) {
      return pathname === href.split('?')[0];
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-border-light shrink-0',
        isCollapsed ? 'justify-center' : 'gap-3'
      )}>
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center shrink-0">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-w-0"
          >
            <span className="text-sm font-semibold text-text-primary truncate">Digital Sales</span>
            <span className="text-[11px] text-text-muted truncate">CRM Platform</span>
          </motion.div>
        )}
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {sections.map((section, sIdx) => (
          <div key={sIdx}>
            {section.title && !isCollapsed && (
              <div className="px-3 mb-2 text-[11px] font-medium text-text-muted uppercase tracking-wider">
                {section.title}
              </div>
            )}
            {section.title && isCollapsed && (
              <div className="mb-2 border-t border-border-light" />
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                const linkContent = (
                  <Link
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150',
                      isCollapsed && 'justify-center px-2',
                      active
                        ? 'bg-primary-50 text-primary-700 shadow-xs'
                        : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-[18px] h-[18px] shrink-0 transition-colors',
                        active ? 'text-primary-600' : 'text-text-muted group-hover:text-text-secondary'
                      )}
                    />
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-auto text-[10px] font-semibold bg-danger text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );

                if (isCollapsed) {
                  return (
                    <TooltipProvider key={item.href} delay={0}>
                      <Tooltip>
                        <TooltipTrigger className="w-full flex justify-center">{linkContent}</TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                }

                return <React.Fragment key={item.href}>{linkContent}</React.Fragment>;
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="hidden md:flex items-center justify-end px-3 py-3 border-t border-border-light shrink-0">
        <button
          onClick={toggle}
          className="p-2 rounded-lg text-text-muted hover:bg-surface-muted hover:text-text-secondary transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        className={cn(
          'hidden md:flex flex-col h-screen bg-surface border-r border-border fixed left-0 top-0 z-40',
          'transition-[width] duration-200 ease-in-out'
        )}
        style={{ width: isCollapsed ? 76 : 248 }}
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -248 }}
              animate={{ x: 0 }}
              exit={{ x: -248 }}
              transition={{ duration: 0.24, ease: [0, 0, 0.2, 1] }}
              className="fixed left-0 top-0 h-screen w-[248px] bg-surface border-r border-border z-50 md:hidden shadow-xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
