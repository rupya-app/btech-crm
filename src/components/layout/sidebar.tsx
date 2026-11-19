'use client';

import React, { useState, createContext, useContext, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  BarChart3,
  FileText,
  Settings,
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
  Layers,
  TrendingUp,
  ShieldAlert,
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
// NAV ITEMS CONFIG WITH STAGE COLOR INDICATORS
// ============================================================

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  stageColor?: string;
  activeBg?: string;
  activeText?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const adminNavSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Command Center', href: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Pipeline Stages',
    items: [
      {
        label: 'All Pipeline Leads',
        href: '/admin/leads',
        icon: Briefcase,
        stageColor: '#147D72',
        activeBg: '#E8F3F1',
        activeText: '#0E5F58',
      },
      {
        label: 'Unassigned Pool',
        href: '/admin/leads?status=unassigned',
        icon: Layers,
        stageColor: '#6366F1',
        activeBg: '#EEF2FF',
        activeText: '#4338CA',
      },
      {
        label: 'New Inquiries',
        href: '/admin/leads?status=new',
        icon: Star,
        stageColor: '#0EA5E9',
        activeBg: '#E0F2FE',
        activeText: '#0369A1',
      },
      {
        label: 'Contacted',
        href: '/admin/leads?status=contacted',
        icon: Phone,
        stageColor: '#3B82F6',
        activeBg: '#DBEAFE',
        activeText: '#1D4ED8',
      },
      {
        label: 'Interested Prospects',
        href: '/admin/leads?status=interested',
        icon: TrendingUp,
        stageColor: '#14B8A6',
        activeBg: '#CCFBF1',
        activeText: '#0F766E',
      },
      {
        label: 'Follow-up Queue',
        href: '/admin/follow-ups',
        icon: Clock,
        stageColor: '#8B5CF6',
        activeBg: '#F3E8FF',
        activeText: '#6D28D9',
      },
      {
        label: 'Pending Decision',
        href: '/admin/leads?status=pending',
        icon: AlertCircle,
        stageColor: '#F59E0B',
        activeBg: '#FEF3C7',
        activeText: '#B45309',
      },
      {
        label: 'Confirmed Won',
        href: '/admin/leads?status=confirmed',
        icon: CheckCircle2,
        stageColor: '#10B981',
        activeBg: '#D1FAE5',
        activeText: '#047857',
      },
      {
        label: 'Closed Lost',
        href: '/admin/leads?status=not_interested',
        icon: Target,
        stageColor: '#F43F5E',
        activeBg: '#FFE4E6',
        activeText: '#BE123C',
      },
      {
        label: 'Disqualified',
        href: '/admin/leads?status=unqualified',
        icon: ShieldAlert,
        stageColor: '#EF4444',
        activeBg: '#FEE2E2',
        activeText: '#B91C1C',
      },
      {
        label: 'Archived Vault',
        href: '/admin/leads?status=archived',
        icon: Archive,
        stageColor: '#64748B',
        activeBg: '#F1F5F9',
        activeText: '#334155',
      },
    ],
  },
  {
    title: 'Data Operations',
    items: [
      { label: 'Import Excel / CSV', href: '/admin/imports', icon: Upload },
      { label: 'Import History', href: '/admin/import-history', icon: History },
      { label: 'Export & Reports', href: '/admin/reports', icon: Download },
    ],
  },
  {
    title: 'Organization',
    items: [
      { label: 'Sales Team', href: '/admin/employees', icon: Users },
      { label: 'Lead Distribution', href: '/admin/assignments', icon: UserPlus },
      { label: 'Sales Analytics', href: '/admin/analytics', icon: BarChart3 },
      { label: 'Audit & Activity Logs', href: '/admin/activity-logs', icon: Activity },
    ],
  },
  {
    title: 'Settings',
    items: [
      { label: 'Platform Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export const employeeNavSections: NavSection[] = [
  {
    title: 'Sales Workspace',
    items: [
      { label: 'My Dashboard', href: '/employee/dashboard', icon: LayoutDashboard },
      { label: 'My Pipeline Leads', href: '/employee/my-leads', icon: Briefcase, stageColor: '#147D72' },
      { label: 'Unassigned Pool', href: '/employee/lead-pool', icon: Layers, stageColor: '#6366F1' },
      { label: 'Follow-up Queue', href: '/employee/follow-ups', icon: Clock, stageColor: '#8B5CF6' },
      { label: 'Call Log History', href: '/employee/call-history', icon: Phone, stageColor: '#3B82F6' },
      { label: 'Confirmed Won', href: '/employee/confirmed', icon: CheckCircle2, stageColor: '#10B981' },
      { label: 'My Performance', href: '/employee/performance', icon: BarChart3 },
      { label: 'Account Profile', href: '/employee/profile', icon: UserCog },
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

export function Sidebar(props: SidebarProps) {
  return (
    <React.Suspense
      fallback={
        <aside className="hidden md:flex flex-col h-screen w-[240px] bg-surface border-r border-border fixed left-0 top-0 z-40" />
      }
    >
      <SidebarInternal {...props} />
    </React.Suspense>
  );
}

function SidebarInternal({ sections }: SidebarProps) {
  const { isCollapsed, isMobileOpen, toggle, setMobileOpen } = useSidebar();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = (href: string) => {
    const [basePath, queryString] = href.split('?');
    if (pathname !== basePath && !pathname.startsWith(basePath + '/')) {
      return false;
    }

    if (queryString) {
      const itemParams = new URLSearchParams(queryString);
      for (const [key, val] of itemParams.entries()) {
        if (searchParams.get(key) !== val) {
          return false;
        }
      }
      return true;
    }

    if (basePath === '/admin/leads' || basePath === '/employee/my-leads') {
      const activeStatus = searchParams.get('status');
      if (activeStatus && activeStatus !== 'all') {
        return false;
      }
    }

    return pathname === basePath;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Logo / Brand */}
      <div
        className={cn(
          'flex items-center h-16 px-5 border-b border-border-light shrink-0',
          isCollapsed ? 'justify-center px-2' : 'gap-3'
        )}
        style={{ height: '64px', padding: isCollapsed ? '0 8px' : '0 20px', gap: '12px' }}
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center shrink-0 shadow-xs">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-w-0"
          >
            <span className="text-[14px] font-bold text-text-primary truncate leading-tight">
              Digital Sales
            </span>
            <span className="text-[11px] font-medium text-text-muted truncate">
              CRM Platform
            </span>
          </motion.div>
        )}
      </div>

      {/* Nav sections */}
      <nav
        className="flex-1 overflow-y-auto flex flex-col"
        style={{ padding: '18px 14px', gap: '20px' }}
      >
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="flex flex-col" style={{ gap: '4px' }}>
            {section.title && !isCollapsed && (
              <div
                className="text-[11px] font-bold text-text-muted/80 uppercase tracking-[0.07em]"
                style={{ padding: '4px 12px 6px 12px' }}
              >
                {section.title}
              </div>
            )}
            {section.title && isCollapsed && (
              <div className="my-1.5 border-t border-border-light" />
            )}
            <div className="flex flex-col" style={{ gap: '3px' }}>
              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                const activeStyle: React.CSSProperties = active
                  ? {
                      backgroundColor: item.activeBg || '#E8F3F1',
                      color: item.activeText || '#0E5F58',
                      fontWeight: 600,
                    }
                  : {};

                const linkContent = (
                  <Link
                    href={item.href}
                    className={cn(
                      'group flex items-center rounded-xl text-[13.5px] font-medium transition-all duration-150',
                      isCollapsed ? 'justify-center' : '',
                      active
                        ? 'font-semibold shadow-2xs'
                        : 'text-text-secondary hover:bg-[#F5F7FA] hover:text-text-primary'
                    )}
                    style={{
                      padding: isCollapsed ? '10px 8px' : '9px 12px',
                      gap: '11px',
                      ...activeStyle,
                    }}
                  >
                    <Icon
                      className="w-[18px] h-[18px] shrink-0 transition-colors"
                      style={{
                        color: active
                          ? item.stageColor || '#147D72'
                          : item.stageColor
                          ? item.stageColor
                          : '#969EAA',
                      }}
                    />
                    {!isCollapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}
                    {!isCollapsed && item.stageColor && (
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor: item.stageColor,
                          opacity: active ? 1 : 0.65,
                        }}
                      />
                    )}
                    {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-auto text-[10px] font-bold bg-danger text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );

                if (isCollapsed) {
                  return (
                    <TooltipProvider key={item.href} delay={0}>
                      <Tooltip>
                        <TooltipTrigger className="w-full flex justify-center">
                          {linkContent}
                        </TooltipTrigger>
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
      <div
        className="hidden md:flex items-center justify-end border-t border-border-light shrink-0"
        style={{ padding: '10px 14px' }}
      >
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
        style={{ width: isCollapsed ? 72 : 240 }}
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
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ duration: 0.24, ease: [0, 0, 0.2, 1] }}
              className="fixed left-0 top-0 h-screen w-[240px] bg-surface border-r border-border z-50 md:hidden shadow-xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
