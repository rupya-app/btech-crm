import { LeadStatusCounts } from '@/services/leads.service';

export interface StageColorTheme {
  dot: string;
  activeBg: string;
  activeText: string;
  activeBorder: string;
  badgeBg: string;
  badgeText: string;
}

export interface TabItem {
  id: string;
  label: string;
  pageTitle: string;
  pageDescription: string;
  countKey: keyof LeadStatusCounts;
  altIds?: string[];
  theme: StageColorTheme;
}

export const CRM_STATUS_TABS: TabItem[] = [
  {
    id: 'all',
    label: 'All Pipeline Leads',
    pageTitle: 'All Pipeline Leads',
    pageDescription: 'Complete master view of sales inquiries across all pipeline stages and assignments.',
    countKey: 'all',
    theme: {
      dot: '#147D72',
      activeBg: '#E8F3F1',
      activeText: '#0E5F58',
      activeBorder: '#24988A',
      badgeBg: '#147D72',
      badgeText: '#FFFFFF',
    },
  },
  {
    id: 'unassigned',
    label: 'Unassigned Pool',
    pageTitle: 'Unassigned Lead Pool',
    pageDescription: 'Newly ingested leads awaiting round-robin distribution or representative self-claiming.',
    countKey: 'unassigned',
    theme: {
      dot: '#6366F1',
      activeBg: '#EEF2FF',
      activeText: '#3730A3',
      activeBorder: '#818CF8',
      badgeBg: '#4F46E5',
      badgeText: '#FFFFFF',
    },
  },
  {
    id: 'new',
    label: 'New Inquiries',
    pageTitle: 'New Sales Inquiries',
    pageDescription: 'Fresh untouched leads ready for first outbound telecalling contact.',
    countKey: 'new',
    theme: {
      dot: '#0EA5E9',
      activeBg: '#E0F2FE',
      activeText: '#075985',
      activeBorder: '#38BDF8',
      badgeBg: '#0284C7',
      badgeText: '#FFFFFF',
    },
  },
  {
    id: 'contacted',
    label: 'Contacted',
    pageTitle: 'Contacted Leads',
    pageDescription: 'Leads where initial outbound call or WhatsApp outreach has been initiated.',
    countKey: 'contacted',
    theme: {
      dot: '#3B82F6',
      activeBg: '#DBEAFE',
      activeText: '#1E40AF',
      activeBorder: '#60A5FA',
      badgeBg: '#2563EB',
      badgeText: '#FFFFFF',
    },
  },
  {
    id: 'interested',
    label: 'Interested Prospects',
    pageTitle: 'Interested Prospects',
    pageDescription: 'High-intent prospects actively evaluating proposals, demos, or commercial terms.',
    countKey: 'interested',
    theme: {
      dot: '#14B8A6',
      activeBg: '#CCFBF1',
      activeText: '#115E59',
      activeBorder: '#2DD4BF',
      badgeBg: '#0D9488',
      badgeText: '#FFFFFF',
    },
  },
  {
    id: 'follow_up',
    label: 'Follow-up Queue',
    pageTitle: 'Follow-up Queue',
    pageDescription: 'Leads with scheduled callbacks, product demonstrations, or check-in reminders.',
    countKey: 'follow_up',
    altIds: ['followup'],
    theme: {
      dot: '#8B5CF6',
      activeBg: '#F3E8FF',
      activeText: '#5B21B6',
      activeBorder: '#A78BFA',
      badgeBg: '#7C3AED',
      badgeText: '#FFFFFF',
    },
  },
  {
    id: 'pending',
    label: 'Pending Decision',
    pageTitle: 'Pending Client Decision',
    pageDescription: 'Awaiting client internal approval, procurement sign-off, or final clarification.',
    countKey: 'pending',
    theme: {
      dot: '#F59E0B',
      activeBg: '#FEF3C7',
      activeText: '#92400E',
      activeBorder: '#FBBF24',
      badgeBg: '#D97706',
      badgeText: '#FFFFFF',
    },
  },
  {
    id: 'confirmed',
    label: 'Confirmed Won',
    pageTitle: 'Confirmed Won Deals',
    pageDescription: 'Successfully converted accounts with confirmed orders and verified deal closure.',
    countKey: 'confirmed',
    theme: {
      dot: '#10B981',
      activeBg: '#D1FAE5',
      activeText: '#065F46',
      activeBorder: '#34D399',
      badgeBg: '#059669',
      badgeText: '#FFFFFF',
    },
  },
  {
    id: 'not_interested',
    label: 'Closed Lost',
    pageTitle: 'Closed Lost / Not Interested',
    pageDescription: 'Prospects that declined the offering or chose an alternative solution.',
    countKey: 'not_interested',
    altIds: ['notinterested'],
    theme: {
      dot: '#F43F5E',
      activeBg: '#FFE4E6',
      activeText: '#9F1239',
      activeBorder: '#FB7185',
      badgeBg: '#E11D48',
      badgeText: '#FFFFFF',
    },
  },
  {
    id: 'unqualified',
    label: 'Disqualified',
    pageTitle: 'Disqualified & Invalid Leads',
    pageDescription: 'Records marked as invalid numbers, wrong business category, or non-serviceable.',
    countKey: 'unqualified',
    altIds: ['invalid'],
    theme: {
      dot: '#EF4444',
      activeBg: '#FEE2E2',
      activeText: '#991B1B',
      activeBorder: '#F87171',
      badgeBg: '#DC2626',
      badgeText: '#FFFFFF',
    },
  },
  {
    id: 'archived',
    label: 'Archived Vault',
    pageTitle: 'Archived Lead Vault',
    pageDescription: 'Historical or inactive records retained for compliance and audit history.',
    countKey: 'archived',
    theme: {
      dot: '#64748B',
      activeBg: '#F1F5F9',
      activeText: '#334155',
      activeBorder: '#94A3B8',
      badgeBg: '#475569',
      badgeText: '#FFFFFF',
    },
  },
];

export function getStageMeta(statusParam?: string): TabItem {
  const norm = (statusParam || 'all').toLowerCase();
  return (
    CRM_STATUS_TABS.find(
      (t) => t.id === norm || (t.altIds && t.altIds.includes(norm))
    ) || CRM_STATUS_TABS[0]
  );
}
