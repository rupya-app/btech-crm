'use client';

import React, { useState } from 'react';
import {
  Settings,
  Tag,
  Building2,
  ShieldCheck,
  Bell,
  CheckCircle2,
  Save,
  Globe,
  Sliders,
  Layers,
  Lock,
} from 'lucide-react';
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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          CRM Platform Settings
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Configure lead distribution policies, pipeline stages, timezone rules, and team permissions.
        </p>
      </div>

      {savedNotice && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-success-bg border border-success/30 text-success text-xs font-semibold animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        {[
          { id: 'general', label: 'General & Timezone', icon: Settings },
          { id: 'pipeline', label: 'Pipeline Stages', icon: Sliders },
          { id: 'pool', label: 'Lead Pool & Claiming', icon: Layers },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-muted'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* GENERAL TAB */}
      {activeTab === 'general' && (
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-5">
          <h2 className="text-sm font-semibold text-text-primary border-b border-border-light pb-2.5">
            Platform Configuration
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">CRM Application Name</Label>
              <Input
                value={crmName}
                onChange={(e) => setCrmName(e.target.value)}
                className="text-xs max-w-md"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Default Operational Timezone</Label>
              <Input
                value={timezone}
                disabled
                className="text-xs max-w-md bg-surface-muted"
              />
              <span className="text-[11px] text-text-muted block">
                Database timestamps are stored strictly in UTC and rendered to users in Asia/Kolkata (IST).
              </span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Default Locale</Label>
              <Input value="English (en-IN)" disabled className="text-xs max-w-md bg-surface-muted" />
            </div>

            <Button type="submit" className="text-xs bg-primary-600 hover:bg-primary-700 text-white mt-2">
              <Save className="w-3.5 h-3.5 mr-1.5" />
              <span>Save Configuration</span>
            </Button>
          </form>
        </div>
      )}

      {/* PIPELINE TAB */}
      {activeTab === 'pipeline' && (
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-4">
          <h2 className="text-sm font-semibold text-text-primary border-b border-border-light pb-2.5">
            Active Lead Pipeline Statuses
          </h2>
          <div className="space-y-2">
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
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-muted/60 border border-border-light text-xs">
                <div className="flex items-center gap-2.5">
                  <span className={`w-3 h-3 rounded-full ${s.color}`} />
                  <span className="font-semibold text-text-primary">{s.status}</span>
                </div>
                <span className="text-text-muted">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LEAD POOL TAB */}
      {activeTab === 'pool' && (
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-5">
          <h2 className="text-sm font-semibold text-text-primary border-b border-border-light pb-2.5">
            Self-Selection Lead Pool Rules
          </h2>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enable-pool"
                checked={enablePool}
                onCheckedChange={(c) => setEnablePool(!!c)}
              />
              <label htmlFor="enable-pool" className="font-medium text-text-primary cursor-pointer">
                Enable Available Lead Pool for sales team self-selection
              </label>
            </div>

            <div className="space-y-1.5 pt-2">
              <Label className="text-xs">Maximum Active Claims Per Representative</Label>
              <Input
                type="number"
                value={maxClaimLimit}
                onChange={(e) => setMaxClaimLimit(e.target.value)}
                className="text-xs max-w-xs"
              />
              <span className="text-[11px] text-text-muted block">
                Prevents single sales reps from claiming excess leads without contacting them.
              </span>
            </div>

            <Button type="submit" className="text-xs bg-primary-600 hover:bg-primary-700 text-white mt-2">
              <Save className="w-3.5 h-3.5 mr-1.5" />
              <span>Update Claiming Policy</span>
            </Button>
          </form>
        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-4 text-xs">
          <h2 className="text-sm font-semibold text-text-primary border-b border-border-light pb-2.5">
            In-App & Email Notification Rules
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Notify representative immediately when new leads are assigned by admin', default: true },
              { label: 'Alert 1 hour before scheduled follow-up appointments', default: true },
              { label: 'Notify representative when a scheduled follow-up becomes overdue', default: true },
              { label: 'Broadcast administrative announcements to all active sales reps', default: true },
              { label: 'Alert administrator when an Excel import job finishes processing', default: true },
            ].map((rule, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <Checkbox id={`rule-${idx}`} defaultChecked={rule.default} />
                <label htmlFor={`rule-${idx}`} className="text-text-secondary cursor-pointer">
                  {rule.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
