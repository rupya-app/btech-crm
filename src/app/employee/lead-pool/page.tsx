'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Search,
  MapPin,
  Building2,
  Lock,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { AdminPageContainer, PageHeader, PageCard } from '@/components/common';
import { Button } from '@/components/ui/button';

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

export default function EmployeeLeadPoolPage() {
  const [leads, setLeads] = useState<PoolLeadPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimedNotice, setClaimedNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPool = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/leads/pool');
        const data = await res.json();
        setLeads(data.leads || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPool();
  }, []);

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
      l.business_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.category?.toLowerCase().includes(search.toLowerCase()) ||
      l.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminPageContainer>
      <PageHeader
        title="Unassigned Lead Pool"
        description="Browse unassigned leads from the live database and claim them to your personal workspace. Phone numbers and contact details unlock immediately upon claiming."
      />

      {/* Notices */}
      {claimedNotice && (
        <div
          className="flex items-center gap-3 rounded-xl bg-success-bg border border-success/30 text-success text-[13px] font-semibold animate-in fade-in-50"
          style={{ padding: '14px 18px' }}
        >
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
        <div
          className="flex items-center gap-3 rounded-xl bg-danger-bg border border-danger/30 text-danger text-[13px] font-semibold animate-in fade-in-50"
          style={{ padding: '14px 18px' }}
        >
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Search and Filters */}
      <PageCard className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div
          className="flex items-center flex-1 max-w-md rounded-xl border border-border bg-[#F8FAFB] focus-within:bg-white focus-within:border-primary-500 transition-all"
          style={{ padding: '0 14px', height: '42px', gap: '10px' }}
        >
          <Search className="w-4 h-4 text-text-muted shrink-0" />
          <input
            type="search"
            placeholder="Search by business category, city, or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-full bg-transparent text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>
        <span className="text-[13px] text-text-muted font-medium">
          Showing <strong className="text-text-primary font-semibold">{filteredLeads.length}</strong> unassigned leads
        </span>
      </PageCard>

      {/* Lead Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '20px' }}>
        {!loading && filteredLeads.length === 0 ? (
          <PageCard className="col-span-full py-16 text-center text-text-muted">
            <Layers className="w-10 h-10 text-text-muted/40 mx-auto mb-2" />
            <p className="text-[15px] font-bold text-text-primary">No unassigned leads in pool</p>
            <p className="text-[13px] text-text-muted mt-1">
              All leads in the database are currently claimed or assigned.
            </p>
          </PageCard>
        ) : (
          filteredLeads.map((lead) => (
            <PageCard
              key={lead.id}
              hover
              className="flex flex-col justify-between min-h-[250px]"
              style={{ borderTop: '3.5px solid #6366F1' }}
            >
              <div>
                <div className="flex items-center justify-between text-xs text-text-muted mb-3">
                  <span
                    className="font-bold text-indigo-700 bg-indigo-50 rounded-full border border-indigo-200 tabular-nums"
                    style={{ padding: '3px 10px' }}
                  >
                    #{lead.lead_number}
                  </span>
                  <span className="font-medium text-[12.5px]">{lead.source || 'Direct'}</span>
                </div>

                <h3 className="text-[16px] font-bold text-text-primary mt-1">
                  {lead.business_name}
                </h3>

                <div className="mt-3.5 space-y-2 text-[13px] text-text-secondary font-medium">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-text-muted shrink-0" />
                    <span>{lead.category || 'General Business'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-text-muted shrink-0" />
                    <span>
                      {lead.city || 'India'}
                      {lead.state ? `, ${lead.state}` : ''}
                    </span>
                  </div>
                </div>

                {/* Locked info badge */}
                <div
                  className="mt-4 rounded-xl bg-[#F8FAFB] border border-border-light flex items-center gap-2 text-xs text-text-muted"
                  style={{ padding: '10px 12px' }}
                >
                  <Lock className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <span>Phone & direct contact details protected until claimed</span>
                </div>
              </div>

              <div
                className="border-t border-border-light flex items-center justify-between"
                style={{ marginTop: '20px', paddingTop: '14px' }}
              >
                <span className="text-xs text-text-muted font-medium">Ready to claim</span>
                <Button
                  disabled={claimingId === lead.id}
                  onClick={() => handleClaim(lead.id, lead.business_name)}
                >
                  {claimingId === lead.id ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Claiming...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <span>Claim Lead</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </div>
            </PageCard>
          ))
        )}
      </div>
    </AdminPageContainer>
  );
}
