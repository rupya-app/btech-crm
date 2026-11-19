'use client';

import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Save,
  Sliders,
  Layers,
} from 'lucide-react';
import {
  AdminPageContainer,
  PageHeader,
  FilterTabs,
  PageCard,
  PageCardHeader,
  SuccessNotice,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'pipeline' | 'pool' | 'notifications'>('general');
  const [savedNotice, setSavedNotice] = useState(false);

  // Form states
  const [crmName, setCrmName] = useState('Digital Sales CRM');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)');
  const [enablePool, setEnablePool] = useState(true);
  const [maxClaimLimit, setMaxClaimLimit] = useState('50');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <AdminPageContainer maxWidth>
      <PageHeader
        title="CRM Platform Settings"
        description="Configure lead distribution policies, pipeline stages, timezone rules, and team permissions."
      />

      {savedNotice && (
        <SuccessNotice message="Settings saved successfully!" />
      )}

      <FilterTabs
        tabs={[
          { id: 'general', label: 'General & Timezone', icon: Settings },
          { id: 'pipeline', label: 'Pipeline Stages', icon: Sliders },
          { id: 'pool', label: 'Lead Pool & Claiming', icon: Layers },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ]}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as any)}
      />

      {/* GENERAL TAB */}
      {activeTab === 'general' && (
        <PageCard>
          <PageCardHeader
            title="Platform Configuration"
            description="Core identity, regional formatting, and operational timezone settings."
            icon={Settings}
          />

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-text-primary">CRM Application Name</Label>
              <Input
                value={crmName}
                onChange={(e) => setCrmName(e.target.value)}
                className="h-11 rounded-xl px-3.5 text-[13px] max-w-md border-border focus:border-primary-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-text-primary">Default Operational Timezone</Label>
              <Input
                value={timezone}
                disabled
                className="h-11 rounded-xl px-3.5 text-[13px] max-w-md bg-surface-muted border-border font-medium"
              />
              <span className="text-[13px] text-text-muted block">
                Database timestamps are stored strictly in UTC and rendered to users in Asia/Kolkata (IST).
              </span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-text-primary">Default Locale</Label>
              <Input
                value="English (en-IN)"
                disabled
                className="h-11 rounded-xl px-3.5 text-[13px] max-w-md bg-surface-muted border-border font-medium"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" className="h-10 px-5 rounded-xl text-[13px] font-semibold bg-primary-600 hover:bg-primary-700 text-white shadow-xs">
                <Save className="w-4 h-4 mr-1.5" />
                <span>Save Configuration</span>
              </Button>
            </div>
          </form>
        </PageCard>
      )}

      {/* PIPELINE TAB */}
      {activeTab === 'pipeline' && (
        <PageCard>
          <PageCardHeader
            title="Active Lead Pipeline Statuses"
            description="Standardized lifecycle stages across all sales queues and analytics."
            icon={Sliders}
          />
          <div className="space-y-3">
            {[
              { status: 'New', color: 'bg-info', desc: 'Newly ingested leads from imports or forms' },
              { status: 'Contacted', color: 'bg-accent-blue', desc: 'Outbound call attempted or message sent' },
              { status: 'Interested', color: 'bg-primary-500', desc: 'Prospect expressed positive interest' },
              { status: 'Follow-up', color: 'bg-warning', desc: 'Specific meeting, call or demo scheduled' },
              { status: 'Pending', color: 'bg-warning', desc: 'Waiting for client internal review / budget approval' },
              { status: 'Confirmed', color: 'bg-success', desc: 'Deal closed and confirmed (Won)' },
              { status: 'Not Interested', color: 'bg-danger', desc: 'Prospect explicitly declined proposal' },
              { status: 'Archived', color: 'bg-text-muted', desc: 'Inactive or stale records' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-surface-muted/60 border border-border-light text-[13px]">
                <div className="flex items-center gap-3">
                  <span className={`w-3.5 h-3.5 rounded-full ${s.color}`} />
                  <span className="font-bold text-text-primary">{s.status}</span>
                </div>
                <span className="text-text-muted">{s.desc}</span>
              </div>
            ))}
          </div>
        </PageCard>
      )}

      {/* LEAD POOL TAB */}
      {activeTab === 'pool' && (
        <PageCard>
          <PageCardHeader
            title="Self-Selection Lead Pool Rules"
            description="Control how sales representatives claim unassigned leads from the shared pool."
            icon={Layers}
          />

          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center space-x-3 p-4 rounded-xl bg-surface-muted/50 border border-border">
              <Checkbox
                id="enable-pool"
                checked={enablePool}
                onCheckedChange={(c) => setEnablePool(!!c)}
              />
              <label htmlFor="enable-pool" className="font-semibold text-text-primary cursor-pointer text-[13px]">
                Enable Available Lead Pool for sales team self-selection
              </label>
            </div>

            <div className="space-y-1.5 pt-1">
              <Label className="text-[13px] font-medium text-text-primary">Maximum Active Claims Per Representative</Label>
              <Input
                type="number"
                value={maxClaimLimit}
                onChange={(e) => setMaxClaimLimit(e.target.value)}
                className="h-11 rounded-xl px-3.5 text-[13px] max-w-xs border-border"
              />
              <span className="text-[13px] text-text-muted block">
                Prevents single sales reps from claiming excess leads without contacting them.
              </span>
            </div>

            <div className="pt-2">
              <Button type="submit" className="h-10 px-5 rounded-xl text-[13px] font-semibold bg-primary-600 hover:bg-primary-700 text-white shadow-xs">
                <Save className="w-4 h-4 mr-1.5" />
                <span>Update Claiming Policy</span>
              </Button>
            </div>
          </form>
        </PageCard>
      )}

      {/* NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <PageCard>
          <PageCardHeader
            title="In-App & Email Notification Rules"
            description="Configure automated alerts for lead assignments, follow-up reminders, and imports."
            icon={Bell}
          />
          <div className="space-y-3">
            {[
              { label: 'Notify representative immediately when new leads are assigned by admin', default: true },
              { label: 'Alert 1 hour before scheduled follow-up appointments', default: true },
              { label: 'Notify representative when a scheduled follow-up becomes overdue', default: true },
              { label: 'Broadcast administrative announcements to all active sales reps', default: true },
              { label: 'Alert administrator when an Excel import job finishes processing', default: true },
            ].map((rule, idx) => (
              <div key={idx} className="flex items-center space-x-3 p-4 rounded-xl bg-surface-muted/50 border border-border">
                <Checkbox id={`rule-${idx}`} defaultChecked={rule.default} />
                <label htmlFor={`rule-${idx}`} className="text-text-secondary cursor-pointer font-medium text-[13px]">
                  {rule.label}
                </label>
              </div>
            ))}
          </div>
        </PageCard>
      )}
    </AdminPageContainer>
  );
}
