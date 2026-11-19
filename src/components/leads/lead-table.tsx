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
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Briefcase,
} from 'lucide-react';
import { Lead } from '@/types';
import { LeadStatusCounts } from '@/services/leads.service';
import { LeadStatusBadge } from './lead-status-badge';
import { LeadPriorityBadge } from './lead-priority-badge';
import { SegmentedStatusTabs } from '@/components/common/segmented-status-tabs';
import { CRM_STATUS_TABS, EMPLOYEE_STATUS_TABS } from '@/components/common/stage-meta';
import { PageToolbar } from '@/components/common/page-toolbar';
import { EmptyState } from '@/components/common/empty-state';
import { SuccessNotice } from '@/components/common/success-notice';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from '@/lib/utils';

interface LeadTableProps {
  initialLeads: Lead[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isAdmin?: boolean;
  statusCounts?: LeadStatusCounts;
  onAssignSelected?: (leadIds: string[]) => void;
  onClaimLead?: (leadId: string) => void;
  isPoolView?: boolean;
}

export function LeadTable(props: LeadTableProps) {
  return (
    <React.Suspense
      fallback={
        <div className="p-12 text-center text-sm text-text-muted" style={{ padding: '48px' }}>
          Loading sales pipeline...
        </div>
      }
    >
      <LeadTableInternal {...props} />
    </React.Suspense>
  );
}

function LeadTableInternal({
  initialLeads,
  total,
  page,
  totalPages,
  isAdmin = true,
  statusCounts,
  onAssignSelected,
  onClaimLead,
  isPoolView = false,
}: LeadTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [reps, setReps] = useState<Array<{ id: string; full_name: string; employee_id: string }>>([]);
  const [targetRepId, setTargetRepId] = useState<string>('workload');
  const [bulkQtyMode, setBulkQtyMode] = useState<'selected' | 'quantity'>('selected');
  const [customQty, setCustomQty] = useState<string>('100');
  const [assignAllUnassigned, setAssignAllUnassigned] = useState<boolean>(false);
  const [assigningBulk, setAssigningBulk] = useState(false);
  const [bulkNotice, setBulkNotice] = useState<string | null>(null);

  const openBulkAssignModal = async (mode: 'selected' | 'quantity' = 'selected') => {
    if (mode === 'selected' && onAssignSelected && selectedLeads.length > 0) {
      onAssignSelected(selectedLeads);
      return;
    }
    setBulkQtyMode(selectedLeads.length > 0 && mode === 'selected' ? 'selected' : 'quantity');
    setIsAssignModalOpen(true);
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      const activeReps = (data.employees || []).filter((e: any) => e.is_active !== false);
      setReps(activeReps);
    } catch {}
  };

  const handleBulkAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setAssigningBulk(true);
    try {
      const isBalanced = targetRepId === 'workload' || targetRepId === 'round_robin';
      const payload: Record<string, any> = {
        mode: isBalanced ? targetRepId : 'single',
        employeeId: isBalanced ? undefined : targetRepId,
      };

      if (bulkQtyMode === 'selected' && selectedLeads.length > 0) {
        payload.leadIds = selectedLeads;
      } else {
        payload.assignAll = assignAllUnassigned;
        payload.count = parseInt(customQty, 10) || 100;
        payload.statusFilter = currentStatus;
      }

      const res = await fetch('/api/leads/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setBulkNotice(data.message);
      setSelectedLeads([]);
      setIsAssignModalOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to assign leads');
    } finally {
      setAssigningBulk(false);
    }
  };

  const unassignedInPage = initialLeads.filter((l: any) => !l.assigned_rep);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(unassignedInPage.map((l) => l.id));
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

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const currentStatus = searchParams.get('status') || 'all';

  return (
    <div
      className="flex flex-col gap-5 w-full min-w-0"
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      {/* 1. Dedicated Color-Coded Segmented Stage Tabs Bar */}
      <SegmentedStatusTabs
        statusCounts={statusCounts}
        tabs={isAdmin ? CRM_STATUS_TABS : EMPLOYEE_STATUS_TABS}
      />

      {/* 2. Page Toolbar with Search, Bulk Quantity Assign & Record Summary */}
      <PageToolbar searchPlaceholder="Search business name, phone, email, contact person, or city...">
        {isAdmin && (
          <Button
            type="button"
            variant="default"
            onClick={() => openBulkAssignModal('quantity')}
          >
            <UserCheck className="w-4 h-4" />
            <span>Bulk Assign by Quantity</span>
          </Button>
        )}
        <div
          className="text-[13px] text-text-muted font-medium bg-[#F8FAFB] rounded-xl border border-border"
          style={{ padding: '9px 16px' }}
        >
          Showing <strong className="text-text-primary font-semibold">{initialLeads.length}</strong> of{' '}
          <strong className="text-text-primary font-semibold">{formatNumber(total)}</strong> leads
        </div>
      </PageToolbar>

      {bulkNotice && <SuccessNotice message={bulkNotice} />}

      {/* Bulk Action Bar (when rows are selected) */}
      {selectedLeads.length > 0 && (
        <div
          className="flex items-center justify-between bg-primary-50 border border-primary-200 rounded-2xl text-xs animate-in fade-in-50"
          style={{ padding: '14px 24px' }}
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary-900 text-sm">
              {selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center gap-2.5" style={{ gap: '10px' }}>
            {isAdmin && (
              <Button
                size="sm"
                onClick={() => openBulkAssignModal('selected')}
                className="h-9 text-xs bg-primary-600 hover:bg-primary-700 text-white px-4 rounded-xl shadow-xs"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Assign Selected ({selectedLeads.length})</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedLeads([])}
              className="h-9 text-xs border-primary-200 text-primary-800 hover:bg-primary-100 rounded-xl px-4"
            >
              Deselect All
            </Button>
          </div>
        </div>
      )}

      {/* 3. Main Data Table (Header 48px, Row 66px, 16px cell padding, 13-14px font) */}
      <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[#F8FAFB] border-b border-border text-text-secondary text-[12px] font-semibold uppercase tracking-wider">
              <tr style={{ height: '48px' }}>
                <th className="w-12 text-center" style={{ padding: '12px 16px' }}>
                  <Checkbox
                    disabled={unassignedInPage.length === 0}
                    checked={
                      unassignedInPage.length > 0 &&
                      selectedLeads.length === unassignedInPage.length
                    }
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    aria-label="Select all unassigned leads"
                  />
                </th>
                <th className="font-semibold whitespace-nowrap w-28" style={{ padding: '12px 16px' }}>
                  Lead ID
                </th>
                <th className="font-semibold min-w-[230px]" style={{ padding: '12px 16px' }}>
                  Business & Contact
                </th>
                <th className="font-semibold whitespace-nowrap w-44" style={{ padding: '12px 16px' }}>
                  Assigned To
                </th>
                <th className="font-semibold whitespace-nowrap w-44" style={{ padding: '12px 16px' }}>
                  Category
                </th>
                <th className="font-semibold whitespace-nowrap w-60" style={{ padding: '12px 16px' }}>
                  Contact Channels
                </th>
                <th className="font-semibold whitespace-nowrap w-40" style={{ padding: '12px 16px' }}>
                  Stage
                </th>
                <th className="font-semibold whitespace-nowrap w-28" style={{ padding: '12px 16px' }}>
                  Priority
                </th>
                <th className="font-semibold whitespace-nowrap w-32" style={{ padding: '12px 16px' }}>
                  Created
                </th>
                <th className="text-right font-semibold whitespace-nowrap w-20" style={{ padding: '12px 16px' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {initialLeads.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '48px 24px' }}>
                    <EmptyState
                      icon={Briefcase}
                      title="No matching leads in this pipeline stage"
                      description={`There are currently no leads matching "${currentStatus === 'all' ? 'your search' : currentStatus}". Try selecting a different stage tab or clearing search filters.`}
                      action={
                        currentStatus !== 'all' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const params = new URLSearchParams(searchParams.toString());
                              params.delete('status');
                              params.set('page', '1');
                              router.push(`?${params.toString()}`);
                            }}
                            className="h-9 px-4 rounded-xl text-xs font-semibold text-primary-700 border-primary-200 hover:bg-primary-50"
                          >
                            View All Pipeline Leads
                          </Button>
                        ) : undefined
                      }
                    />
                  </td>
                </tr>
              ) : (
                initialLeads.map((lead) => {
                  const assignedRep = (lead as any).assigned_rep;
                  const isAlreadyAssigned = Boolean(assignedRep);
                  const isSelected = selectedLeads.includes(lead.id);
                  const detailUrl = isAdmin
                    ? `/admin/leads/${lead.id}`
                    : `/employee/my-leads/${lead.id}`;
                  const waUrl = getWhatsAppUrl(lead.normalized_phone || lead.phone);
                  const telUrl = getTelUrl(lead.phone);

                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-[#F8FAFB] transition-colors ${
                        isSelected ? 'bg-primary-50/40' : ''
                      }`}
                      style={{ height: '66px' }}
                    >
                      {/* Checkbox (Locked if already assigned to prevent duplicate allocation) */}
                      <td
                        className="text-center"
                        style={{ padding: '14px 16px' }}
                        title={
                          isAlreadyAssigned
                            ? `Already assigned to ${assignedRep.full_name} — locked against duplicate assignment`
                            : 'Select lead for assignment'
                        }
                      >
                        <Checkbox
                          disabled={isAlreadyAssigned}
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            !isAlreadyAssigned && handleSelectOne(lead.id, !!checked)
                          }
                          aria-label={`Select lead ${lead.lead_number}`}
                        />
                      </td>

                      {/* Lead Number */}
                      <td
                        className="font-bold text-primary-700 tabular-nums whitespace-nowrap text-[13.5px]"
                        style={{ padding: '14px 16px' }}
                      >
                        <Link href={detailUrl} className="hover:underline">
                          #{lead.lead_number}
                        </Link>
                      </td>

                      {/* Business & Contact Person */}
                      <td style={{ padding: '14px 16px' }}>
                        <div className="flex flex-col" style={{ gap: '2px' }}>
                          <Link
                            href={detailUrl}
                            className="font-bold text-text-primary hover:text-primary-600 transition-colors text-[14px] truncate max-w-[260px]"
                          >
                            {lead.business_name}
                          </Link>
                          {lead.contact_person && (
                            <span className="text-[12.5px] text-text-muted truncate max-w-[240px]">
                              {lead.contact_person}
                              {lead.city ? ` • ${lead.city}` : ''}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Assigned To (Exclusive Ownership Indicator) */}
                      <td className="whitespace-nowrap" style={{ padding: '14px 16px' }}>
                        {assignedRep ? (
                          <Link
                            href={isAdmin ? `/admin/employees/${assignedRep.id}` : '#'}
                            className="inline-flex items-center rounded-full bg-[#E8F3F1] text-[#0E5F58] border border-[#A3DCD5] text-[12px] font-semibold hover:bg-[#DDF2EE] transition-colors"
                            style={{ padding: '4px 10px', gap: '6px' }}
                            title="Exclusively assigned — protected from duplicate allocation"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-[#147D72] shrink-0" />
                            <span>
                              {assignedRep.full_name}
                              {assignedRep.employee_id ? ` (${assignedRep.employee_id})` : ''}
                            </span>
                          </Link>
                        ) : (
                          <span
                            className="inline-flex items-center rounded-full bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE] text-[12px] font-semibold"
                            style={{ padding: '4px 10px', gap: '6px' }}
                          >
                            <span className="w-2 h-2 rounded-full bg-[#6366F1]" />
                            <span>Unassigned Pool</span>
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td
                        className="text-text-secondary font-medium text-[13px] whitespace-nowrap"
                        style={{ padding: '14px 16px' }}
                      >
                        <span className="truncate max-w-[170px] block" title={lead.category || ''}>
                          {lead.category || '—'}
                        </span>
                      </td>

                      {/* Contact Channels (Direct Call & WhatsApp) */}
                      <td style={{ padding: '14px 16px' }}>
                        <div className="flex items-center" style={{ gap: '8px' }}>
                          {telUrl && (
                            <a
                              href={telUrl}
                              className="inline-flex items-center rounded-lg bg-[#F8FAFB] hover:bg-primary-50 hover:text-primary-700 text-text-secondary border border-border text-xs font-semibold transition-colors whitespace-nowrap"
                              style={{ padding: '6px 10px', gap: '6px' }}
                              title={`Call ${lead.phone}`}
                            >
                              <Phone className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                              <span className="tabular-nums">{lead.phone}</span>
                            </a>
                          )}

                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors inline-flex items-center justify-center"
                              style={{ padding: '7px' }}
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {lead.email && (
                            <a
                              href={`mailto:${lead.email}`}
                              className="rounded-lg bg-[#F8FAFB] hover:bg-white text-text-muted hover:text-text-primary border border-border transition-colors inline-flex items-center justify-center"
                              style={{ padding: '7px' }}
                              title={`Email: ${lead.email}`}
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap" style={{ padding: '14px 16px' }}>
                        <LeadStatusBadge status={lead.status} />
                      </td>

                      {/* Priority */}
                      <td className="whitespace-nowrap" style={{ padding: '14px 16px' }}>
                        <LeadPriorityBadge priority={lead.priority} />
                      </td>

                      {/* Created Date */}
                      <td
                        className="text-text-muted tabular-nums whitespace-nowrap text-[12.5px]"
                        style={{ padding: '14px 16px' }}
                      >
                        {formatDate(lead.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="text-right whitespace-nowrap" style={{ padding: '14px 16px' }}>
                        {isPoolView ? (
                          <Button
                            size="sm"
                            onClick={() => onClaimLead && onClaimLead(lead.id)}
                            className="h-8.5 text-xs bg-primary-600 hover:bg-primary-700 text-white font-medium px-3.5 rounded-lg shadow-xs"
                          >
                            Claim Lead
                          </Button>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-text-muted hover:text-text-primary hover:bg-[#F8FAFB]"
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
        <div
          className="flex items-center justify-between border-t border-border bg-[#F8FAFB] text-[13px] text-text-secondary"
          style={{ padding: '16px 24px' }}
        >
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-text-primary font-semibold">{initialLeads.length}</strong> of{' '}
              <strong className="text-text-primary font-semibold">{formatNumber(total)}</strong> leads
            </span>
          </div>

          <div className="flex items-center gap-3" style={{ gap: '12px' }}>
            <span className="text-text-muted font-medium text-xs">
              Page {page} of {totalPages || 1}
            </span>

            <div className="flex items-center gap-1.5" style={{ gap: '6px' }}>
              <Button
                variant="outline"
                size="icon"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
                className="h-9 w-9 rounded-xl border-border bg-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="h-9 w-9 rounded-xl border-border bg-white"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Assign Leads Modal (Supports both Checked Rows & Large Quantity Batching) */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>
              {bulkQtyMode === 'selected' && selectedLeads.length > 0
                ? `Assign ${selectedLeads.length} Selected Lead(s)`
                : 'High-Volume Bulk Lead Assignment'}
            </DialogTitle>
            <DialogDescription>
              Assign leads in bulk to a single representative or distribute them evenly across your sales team.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBulkAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {selectedLeads.length > 0 && (
              <div className="grid grid-cols-2" style={{ gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setBulkQtyMode('selected')}
                  className="rounded-xl border text-xs font-bold transition-all cursor-pointer"
                  style={{
                    padding: '10px',
                    backgroundColor: bulkQtyMode === 'selected' ? '#E8F3F1' : '#F8FAFB',
                    color: bulkQtyMode === 'selected' ? '#0E5F58' : '#68717D',
                    borderColor: bulkQtyMode === 'selected' ? '#24988A' : '#E7EAEE',
                  }}
                >
                  Checked Rows ({selectedLeads.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBulkQtyMode('quantity')}
                  className="rounded-xl border text-xs font-bold transition-all cursor-pointer"
                  style={{
                    padding: '10px',
                    backgroundColor: bulkQtyMode === 'quantity' ? '#E8F3F1' : '#F8FAFB',
                    color: bulkQtyMode === 'quantity' ? '#0E5F58' : '#68717D',
                    borderColor: bulkQtyMode === 'quantity' ? '#24988A' : '#E7EAEE',
                  }}
                >
                  Custom Large Quantity
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="text-[13px] font-semibold text-text-primary">
                Target Representative / Distribution Strategy
              </label>
              <Select value={targetRepId} onValueChange={(val) => setTargetRepId(val || 'workload')}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose assignment target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workload">Auto: Workload Balanced Across Team</SelectItem>
                  <SelectItem value="round_robin">Auto: Equal Round-Robin Split Across Team</SelectItem>
                  {reps.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      Direct to Rep: {r.full_name} ({r.employee_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {bulkQtyMode === 'quantity' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="text-[13px] font-semibold text-text-primary">
                    Quick Quantity Presets
                  </label>
                  <div className="grid grid-cols-3" style={{ gap: '8px' }}>
                    {[
                      { label: '50 Leads', val: '50', isAll: false },
                      { label: '100 Leads', val: '100', isAll: false },
                      { label: '250 Leads', val: '250', isAll: false },
                      { label: '500 Leads', val: '500', isAll: false },
                      { label: '1,000 Leads', val: '1000', isAll: false },
                      {
                        label: `All Unassigned (${formatNumber(statusCounts?.unassigned ?? total)})`,
                        val: String(statusCounts?.unassigned ?? total),
                        isAll: true,
                      },
                    ].map((p) => {
                      const active = p.isAll
                        ? assignAllUnassigned
                        : !assignAllUnassigned && customQty === p.val;
                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => {
                            setAssignAllUnassigned(p.isAll);
                            setCustomQty(p.val);
                          }}
                          className="rounded-xl border text-xs font-bold tabular-nums transition-all cursor-pointer"
                          style={{
                            padding: '10px 6px',
                            backgroundColor: active ? '#147D72' : '#F8FAFB',
                            color: active ? '#FFFFFF' : '#525B68',
                            borderColor: active ? '#147D72' : '#E7EAEE',
                          }}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-[13px] font-semibold text-text-primary">
                    Or Type Any Exact Quantity
                  </label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="e.g. 150, 400, 925..."
                    value={assignAllUnassigned ? statusCounts?.unassigned ?? total : customQty}
                    onChange={(e) => {
                      setAssignAllUnassigned(false);
                      setCustomQty(e.target.value);
                    }}
                  />
                </div>
              </>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={assigningBulk}>
                {assigningBulk
                  ? 'Allocating Leads...'
                  : bulkQtyMode === 'selected' && selectedLeads.length > 0
                  ? `Confirm Assignment (${selectedLeads.length})`
                  : assignAllUnassigned
                  ? `Allocate All Unassigned Leads`
                  : `Allocate ${customQty} Leads Now`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
