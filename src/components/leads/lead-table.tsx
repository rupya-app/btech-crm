'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Phone,
  Mail,
  MoreHorizontal,
  ExternalLink,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { Lead, LeadStatus, LeadPriority } from '@/types';
import { LeadStatusBadge } from './lead-status-badge';
import { LeadPriorityBadge } from './lead-priority-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  getWhatsAppUrl,
  getTelUrl,
  formatDate,
  formatNumber,
  truncate,
} from '@/lib/utils';

interface LeadTableProps {
  initialLeads: Lead[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isAdmin?: boolean;
  onAssignSelected?: (leadIds: string[]) => void;
  onClaimLead?: (leadId: string) => void;
  isPoolView?: boolean;
}

export function LeadTable(props: LeadTableProps) {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-text-muted">Loading leads...</div>}>
      <LeadTableInternal {...props} />
    </React.Suspense>
  );
}

function LeadTableInternal({
  initialLeads,
  total,
  page,
  pageSize,
  totalPages,
  isAdmin = true,
  onAssignSelected,
  onClaimLead,
  isPoolView = false,
}: LeadTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(initialLeads.map((l) => l.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads((prev) => [...prev, id]);
    } else {
      setSelectedLeads((prev) => prev.filter((item) => item !== id));
    }
  };

  // Search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput.trim()) {
      params.set('search', searchInput.trim());
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  // Status Filter Change
  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === 'all') {
      params.delete('status');
    } else {
      params.set('status', status);
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  // Pagination Change
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const currentStatus = searchParams.get('status') || 'all';

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface p-4 rounded-2xl border border-border shadow-xs">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            type="search"
            placeholder="Search business name, phone, email, contact..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 h-9 text-xs bg-surface-muted/50 border-border focus:border-primary-500 rounded-lg"
          />
        </form>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Leads' },
            { id: 'new', label: 'New' },
            { id: 'contacted', label: 'Contacted' },
            { id: 'interested', label: 'Interested' },
            { id: 'follow_up', label: 'Follow-up' },
            { id: 'pending', label: 'Pending' },
            { id: 'confirmed', label: 'Confirmed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                currentStatus === tab.id
                  ? 'bg-primary-50 text-primary-700 font-semibold border border-primary-200'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Bar (when rows are selected) */}
      {selectedLeads.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-primary-50 border border-primary-200 rounded-xl text-xs animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary-900">
              {selectedLeads.length} leads selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && onAssignSelected && (
              <Button
                size="sm"
                onClick={() => onAssignSelected(selectedLeads)}
                className="h-8 text-xs bg-primary-600 hover:bg-primary-700 text-white"
              >
                <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                <span>Assign to Employee</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedLeads([])}
              className="h-8 text-xs border-primary-200 text-primary-800 hover:bg-primary-100"
            >
              Deselect All
            </Button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-muted border-b border-border text-text-secondary font-semibold">
              <tr>
                <th className="py-3 px-4 w-10">
                  <Checkbox
                    checked={
                      initialLeads.length > 0 &&
                      selectedLeads.length === initialLeads.length
                    }
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    aria-label="Select all"
                  />
                </th>
                <th className="py-3 px-3">Lead ID</th>
                <th className="py-3 px-3">Business & Contact</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Contact Channels</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {initialLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-text-muted">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-text-muted/60 mb-2" />
                      <p className="text-sm font-medium text-text-secondary">No leads found</p>
                      <p className="text-xs mt-1">Try adjusting your search criteria or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                initialLeads.map((lead) => {
                  const isSelected = selectedLeads.includes(lead.id);
                  const detailUrl = isAdmin
                    ? `/admin/leads/${lead.id}`
                    : `/employee/my-leads/${lead.id}`;
                  const waUrl = getWhatsAppUrl(lead.normalized_phone || lead.phone);
                  const telUrl = getTelUrl(lead.phone);

                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-surface-muted/60 transition-colors ${
                        isSelected ? 'bg-primary-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleSelectOne(lead.id, !!checked)
                          }
                          aria-label={`Select lead ${lead.lead_number}`}
                        />
                      </td>

                      {/* Lead Number */}
                      <td className="py-3.5 px-3 font-semibold text-primary-700 tabular-nums">
                        <Link href={detailUrl} className="hover:underline">
                          #{lead.lead_number}
                        </Link>
                      </td>

                      {/* Business & Contact Person */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col">
                          <Link
                            href={detailUrl}
                            className="font-semibold text-text-primary hover:text-primary-600 transition-colors truncate max-w-[220px]"
                          >
                            {lead.business_name}
                          </Link>
                          {lead.contact_person && (
                            <span className="text-[11px] text-text-muted mt-0.5 truncate max-w-[200px]">
                              {lead.contact_person}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 text-text-secondary">
                        <span className="truncate max-w-[140px] block" title={lead.category || ''}>
                          {lead.category || '—'}
                        </span>
                      </td>

                      {/* Contact Channels (Direct Call & WhatsApp) */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          {telUrl && (
                            <a
                              href={telUrl}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-surface-muted hover:bg-primary-50 hover:text-primary-700 text-text-secondary border border-border text-[11px] font-medium transition-colors"
                              title={`Call ${lead.phone}`}
                            >
                              <Phone className="w-3 h-3 text-primary-600" />
                              <span className="tabular-nums">{lead.phone}</span>
                            </a>
                          )}

                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {lead.email && (
                            <a
                              href={`mailto:${lead.email}`}
                              className="p-1 rounded-md bg-surface-muted hover:bg-surface text-text-muted hover:text-text-primary border border-border transition-colors"
                              title={`Email: ${lead.email}`}
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <LeadStatusBadge status={lead.status} />
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-3">
                        <LeadPriorityBadge priority={lead.priority} />
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-3 text-text-muted tabular-nums">
                        {formatDate(lead.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {isPoolView ? (
                          <Button
                            size="sm"
                            onClick={() => onClaimLead && onClaimLead(lead.id)}
                            className="h-7 text-xs bg-primary-600 hover:bg-primary-700 text-white font-medium px-3 rounded-lg shadow-2xs"
                          >
                            Claim Lead
                          </Button>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 text-xs shadow-md">
                              <DropdownMenuLabel>Lead Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={detailUrl} className="flex items-center gap-2 cursor-pointer">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>View Lead Details</span>
                                </Link>
                              </DropdownMenuItem>
                              {telUrl && (
                                <DropdownMenuItem asChild>
                                  <a href={telUrl} className="flex items-center gap-2 cursor-pointer">
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>Initiate Phone Call</span>
                                  </a>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem asChild>
                                <Link href={`${detailUrl}#remark`} className="flex items-center gap-2 cursor-pointer">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>Add Remark</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`${detailUrl}#followup`} className="flex items-center gap-2 cursor-pointer">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Schedule Follow-up</span>
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-text-primary">{initialLeads.length}</strong> of{' '}
              <strong className="text-text-primary">{formatNumber(total)}</strong> leads
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-text-muted">
              Page {page} of {totalPages || 1}
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
                className="h-8 w-8 text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="h-8 w-8 text-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
