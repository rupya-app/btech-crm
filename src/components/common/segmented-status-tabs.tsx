'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatNumber } from '@/lib/utils';
import { LeadStatusCounts } from '@/services/leads.service';
import { CRM_STATUS_TABS, TabItem } from './stage-meta';

interface SegmentedStatusTabsProps {
  statusCounts?: LeadStatusCounts;
  tabs?: TabItem[];
  className?: string;
}

export function SegmentedStatusTabs({
  statusCounts,
  tabs = CRM_STATUS_TABS,
  className,
}: SegmentedStatusTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatusParam = searchParams.get('status') || 'all';
  const [optimisticTab, setOptimisticTab] = useState(currentStatusParam);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setOptimisticTab(currentStatusParam);
  }, [currentStatusParam]);

  const handleTabClick = (tabId: string) => {
    setOptimisticTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    if (tabId === 'all') {
      params.delete('status');
    } else {
      params.set('status', tabId);
    }
    params.set('page', '1');
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div
      className={`bg-white border border-[#E7EAEE] rounded-2xl shadow-xs transition-opacity ${
        isPending ? 'opacity-80' : 'opacity-100'
      } ${className || ''}`}
      style={{ padding: '14px 18px' }}
    >
      <div
        className="flex items-center overflow-x-auto scrollbar-none"
        style={{ gap: '10px', padding: '2px 0' }}
      >
        {tabs.map((tab) => {
          const isActive =
            optimisticTab === tab.id ||
            (tab.altIds && tab.altIds.includes(optimisticTab));
          const count = statusCounts ? statusCounts[tab.countKey] ?? 0 : 0;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className="rounded-xl text-[13px] font-semibold flex items-center transition-all duration-100 cursor-pointer shrink-0"
              style={{
                minHeight: '40px',
                padding: '8px 14px',
                gap: '8px',
                backgroundColor: isActive ? tab.theme.activeBg : '#F8FAFB',
                color: isActive ? tab.theme.activeText : '#525B68',
                border: `1.5px solid ${isActive ? tab.theme.activeBorder : '#E7EAEE'}`,
                fontWeight: isActive ? 700 : 600,
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: tab.theme.dot }}
              />
              <span>{tab.label}</span>
              <span
                className="text-[11.5px] rounded-full font-bold tabular-nums transition-colors"
                style={{
                  padding: '2px 8px',
                  backgroundColor: isActive ? tab.theme.badgeBg : '#E7EAEE',
                  color: isActive ? tab.theme.badgeText : '#475569',
                }}
              >
                {formatNumber(count)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
