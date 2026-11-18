'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Layers,
  Search,
  MapPin,
  Building2,
  Lock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PoolLeadPreview {
  id: string;
  lead_number: number;
  business_name: string;
  category: string;
  city: string;
  state: string;
  source: string;
  created_at: string;
}

const DEMO_POOL_LEADS: PoolLeadPreview[] = [
  {
    id: 'pool-1',
    lead_number: 10012,
    business_name: 'Metro Retail Mart Superstores',
    category: 'Retail & Supermarkets',
    city: 'Hyderabad',
    state: 'Telangana',
    source: 'Excel Import Q1',
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
  {
    id: 'pool-2',
    lead_number: 10013,
    business_name: 'Starlight Solar Tech Solutions',
    category: 'Renewable Energy',
    city: 'Ahmedabad',
    state: 'Gujarat',
    source: 'Trade Show Expo',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'pool-3',
    lead_number: 10014,
    business_name: 'PrimeCare Diagnostics & Pathology',
    category: 'Healthcare & Clinical',
    city: 'Indore',
    state: 'Madhya Pradesh',
    source: 'Excel Import Q1',
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
  },
  {
    id: 'pool-4',
    lead_number: 10015,
    business_name: 'NovaFin Advisory & Financial Services',
    category: 'Finance & Banking',
    city: 'Mumbai',
    state: 'Maharashtra',
    source: 'Website Lead Form',
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
];

export default function EmployeeLeadPoolPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<PoolLeadPreview[]>(DEMO_POOL_LEADS);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimedNotice, setClaimedNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const handleClaim = async (leadId: string, businessName: string) => {
    setClaimingId(leadId);
    setClaimedNotice(null);
    setErrorNotice(null);

    try {
      const res = await fetch('/api/leads/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to claim lead');
      }

      // Remove claimed lead from pool view immediately
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      setClaimedNotice(`Success! "${businessName}" has been claimed and added to your leads.`);
    } catch (err: any) {
      setErrorNotice(err.message || 'Another employee just claimed this lead.');
    } finally {
      setClaimingId(null);
    }
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.business_name.toLowerCase().includes(search.toLowerCase()) ||
      l.category.toLowerCase().includes(search.toLowerCase()) ||
      l.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-blue/90 to-primary-700 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-white mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Self-Selection Pool • Atomic Claim Protection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Available Lead Pool
          </h1>
          <p className="text-xs sm:text-sm text-white/80 mt-1">
            Browse unassigned leads and claim them to your personal workspace. Phone numbers and full contact details unlock immediately upon claiming.
          </p>
        </div>
      </div>

      {/* Notices */}
      {claimedNotice && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-success-bg border border-success/30 text-success text-xs font-semibold animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{claimedNotice}</span>
          <Link
            href="/employee/my-leads"
            className="ml-auto underline font-bold hover:text-success/80"
          >
            View in My Leads →
          </Link>
        </div>
      )}

      {errorNotice && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-danger-bg border border-danger/30 text-danger text-xs font-semibold animate-in fade-in-50">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-border shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            type="search"
            placeholder="Search by business category, city, or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-surface-muted/50 border-border rounded-lg"
          />
        </div>
        <span className="text-xs text-text-muted">
          Showing <strong>{filteredLeads.length}</strong> unassigned leads
        </span>
      </div>

      {/* Lead Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLeads.length === 0 ? (
          <div className="col-span-full py-16 text-center text-text-muted">
            <Layers className="w-10 h-10 text-text-muted/40 mx-auto mb-2" />
            <p className="text-sm font-semibold text-text-secondary">No leads available in pool</p>
            <p className="text-xs mt-1">All leads are currently claimed or assigned by administrator.</p>
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="bg-surface p-5 rounded-2xl border border-border hover:border-primary-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-text-muted mb-2">
                  <span className="font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full">
                    #{lead.lead_number}
                  </span>
                  <span>{lead.source}</span>
                </div>

                <h3 className="text-sm font-bold text-text-primary mt-1">
                  {lead.business_name}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-text-muted" />
                    <span>{lead.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-text-muted" />
                    <span>{lead.city}, {lead.state}</span>
                  </div>
                </div>

                {/* Locked info badge */}
                <div className="mt-4 p-2.5 rounded-xl bg-surface-muted border border-border-light flex items-center gap-2 text-[11px] text-text-muted">
                  <Lock className="w-3.5 h-3.5 text-text-muted" />
                  <span>Phone & direct contact details protected</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border-light flex items-center justify-between">
                <span className="text-[10px] text-text-muted">Ready to claim</span>
                <Button
                  size="sm"
                  disabled={claimingId === lead.id}
                  onClick={() => handleClaim(lead.id, lead.business_name)}
                  className="text-xs h-8 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 rounded-xl shadow-2xs"
                >
                  {claimingId === lead.id ? (
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Claiming...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <span>Claim Lead</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
