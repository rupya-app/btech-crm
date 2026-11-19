import React from 'react';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

interface FilterTab {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

/**
 * Reusable segmented tab bar for page-level filters.
 * Used by Follow-ups, Settings, and other pages with local state tabs.
 */
export function FilterTabs({ tabs, activeTab, onTabChange, className }: FilterTabsProps) {
  return (
    <div
      className={cn(
        'flex items-center rounded-2xl bg-white border border-border shadow-xs overflow-x-auto',
        className
      )}
      style={{ padding: '8px', gap: '8px' }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center rounded-xl text-[13px] font-semibold whitespace-nowrap transition-colors cursor-pointer',
              isActive
                ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-xs'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-muted'
            )}
            style={{
              padding: '9px 16px',
              gap: '8px',
              backgroundColor: isActive ? '#E8F3F1' : 'transparent',
              color: isActive ? '#0E5F58' : '#68717D',
              border: isActive ? '1px solid #A3DCD5' : '1px solid transparent',
            }}
          >
            {Icon && <Icon className="w-4 h-4 shrink-0" />}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
