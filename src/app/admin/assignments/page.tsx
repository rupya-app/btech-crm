'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  ArrowRight,
  Shuffle,
  Scale,
  AlertCircle,
  ExternalLink,
  Zap,
} from 'lucide-react';
import {
  AdminPageContainer,
  PageHeader,
  PageCard,
  PageCardHeader,
  DataTable,
  DataTableRow,
  DataTableCell,
  SuccessNotice,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials, formatNumber } from '@/lib/utils';

interface RepWorkload {
  id: string;
  name: string;
  empId: string;
  department?: string;
  activeLeads: number;
  pendingLeads: number;
  callsMade: number;
  confirmedDeals: number;
  conversionRate: number;
}

export default function AdminAssignmentsPage() {
  const router = useRouter();
  const [reps, setReps] = useState<RepWorkload[]>([]);
  const [selectedRep, setSelectedRep] = useState<string>('');
  const [distributionMode, setDistributionMode] = useState<'single' | 'round_robin' | 'workload'>('workload');
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [assignCount, setAssignCount] = useState('100');
  const [assignAllFlag, setAssignAllFlag] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const fetchWorkloadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/leads/assign');
      const data = await res.json();
      setUnassignedCount(data.unassignedCount || 0);
      setReps(data.reps || []);
      if (data.reps?.length > 0 && !selectedRep) {
        setSelectedRep(data.reps[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkloadData();
  }, []);

  const executeAssignment = async (
    modeOverride?: 'single' | 'round_robin' | 'workload',
    repOverride?: string,
    qtyOverride?: number,
    allOverride?: boolean
  ) => {
    const modeToUse = modeOverride || distributionMode;
    const repToUse = repOverride || selectedRep;
    const isAll = allOverride !== undefined ? allOverride : assignAllFlag;
    const countToUse =
      qtyOverride !== undefined
        ? qtyOverride
        : isAll
        ? unassignedCount
        : parseInt(assignCount, 10);

    if (!isAll && (!countToUse || countToUse <= 0)) return;

    setAssigning(true);
    setSuccessNotice(null);
    setErrorNotice(null);

    try {
      const res = await fetch('/api/leads/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: modeToUse,
          employeeId: repToUse,
          count: countToUse,
          assignAll: isAll,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to distribute leads');
      }

      setSuccessNotice(data.message);
      await fetchWorkloadData();
    } catch (err: any) {
      setErrorNotice(err.message || 'Lead allocation failed');
    } finally {
      setAssigning(false);
    }
  };

  const handleExecuteAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeAssignment();
  };

  return (
    <AdminPageContainer>
      <PageHeader
        title="Bulk Lead Distribution & Workload Balancing"
        description="Simple high-volume lead allocation: assign hundreds or thousands of leads to a specific representative or split them automatically across your entire team."
        actions={
          unassignedCount > 0 && reps.length > 0 ? (
            <Button
              onClick={() => executeAssignment('round_robin', undefined, unassignedCount, true)}
              disabled={assigning}
            >
              <Zap className="w-4 h-4" />
              <span>
                Split All {formatNumber(unassignedCount)} Unassigned Leads Equally
              </span>
            </Button>
          ) : undefined
        }
      />

      {successNotice && <SuccessNotice message={successNotice} />}

      {errorNotice && (
        <div
          className="flex items-center gap-3 rounded-xl bg-danger-bg border border-danger/30 text-danger text-[13px] font-semibold"
          style={{ padding: '14px 18px' }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: '20px' }}>
        <PageCard style={{ borderTop: '3.5px solid #6366F1' }}>
          <span className="text-[13px] font-semibold text-text-secondary">
            Unassigned Leads Ready to Allocate
          </span>
          <div className="mt-2 text-3xl font-bold text-primary-700 tabular-nums">
            {formatNumber(unassignedCount)}
          </div>
          <span className="text-[13px] text-text-muted mt-1.5 block">
            Available in pool for instant bulk distribution
          </span>
        </PageCard>

        <PageCard style={{ borderTop: '3.5px solid #147D72' }}>
          <span className="text-[13px] font-semibold text-text-secondary">
            Active Sales Representatives
          </span>
          <div className="mt-2 text-3xl font-bold text-text-primary tabular-nums">
            {reps.length}
          </div>
          <span className="text-[13px] text-text-muted mt-1.5 block">
            Click any representative below to view their daily work log
          </span>
        </PageCard>

        <PageCard style={{ borderTop: '3.5px solid #10B981' }}>
          <span className="text-[13px] font-semibold text-text-secondary">
            Equal Share Per Representative
          </span>
          <div className="mt-2 text-3xl font-bold text-success tabular-nums">
            {reps.length > 0 ? formatNumber(Math.floor(unassignedCount / reps.length)) : 0}
          </div>
          <span className="text-[13px] text-text-muted mt-1.5 block">
            Leads per rep if all {formatNumber(unassignedCount)} unassigned are split equally
          </span>
        </PageCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '24px' }}>
        {/* Allocation Form */}
        <PageCard>
          <PageCardHeader
            title="High-Volume Lead Allocator"
            description="Choose strategy and enter any quantity"
            icon={UserPlus}
          />

          <form
            onSubmit={handleExecuteAssignment}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="text-[13px] font-semibold text-text-primary block">
                1. Distribution Strategy
              </label>
              <div className="grid grid-cols-3" style={{ gap: '10px' }}>
                {[
                  { id: 'workload', label: 'Balanced', icon: Scale },
                  { id: 'round_robin', label: 'Equal Split', icon: Shuffle },
                  { id: 'single', label: 'Single Rep', icon: UserPlus },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = distributionMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setDistributionMode(mode.id as any)}
                      className="rounded-xl border text-[13px] font-medium flex flex-col items-center justify-center transition-all cursor-pointer"
                      style={{
                        padding: '14px 10px',
                        gap: '6px',
                        backgroundColor: isSelected ? '#E8F3F1' : '#F8FAFB',
                        color: isSelected ? '#0E5F58' : '#68717D',
                        borderColor: isSelected ? '#24988A' : '#E7EAEE',
                        fontWeight: isSelected ? 700 : 500,
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {distributionMode === 'single' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="text-[13px] font-semibold text-text-primary block">
                  2. Select Sales Representative
                </label>
                <Select
                  value={selectedRep}
                  onValueChange={(val) => setSelectedRep(val || '')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose sales representative" />
                  </SelectTrigger>
                  <SelectContent>
                    {reps.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name} ({r.empId}) • {r.activeLeads} active
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="text-[13px] font-semibold text-text-primary block">
                {distributionMode === 'single' ? '3.' : '2.'} Quick Batch Quantity Presets
              </label>
              <div className="grid grid-cols-3" style={{ gap: '8px' }}>
                {[
                  { label: '50', val: '50', isAll: false },
                  { label: '100', val: '100', isAll: false },
                  { label: '250', val: '250', isAll: false },
                  { label: '500', val: '500', isAll: false },
                  { label: '1,000', val: '1000', isAll: false },
                  {
                    label: `All (${formatNumber(unassignedCount)})`,
                    val: String(unassignedCount || 100),
                    isAll: true,
                  },
                ].map((preset) => {
                  const isActive = preset.isAll
                    ? assignAllFlag
                    : !assignAllFlag && assignCount === preset.val;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setAssignAllFlag(preset.isAll);
                        setAssignCount(preset.val);
                      }}
                      className="rounded-xl border text-[12.5px] font-bold tabular-nums transition-colors cursor-pointer"
                      style={{
                        padding: '10px 6px',
                        backgroundColor: isActive ? '#147D72' : '#F8FAFB',
                        color: isActive ? '#FFFFFF' : '#525B68',
                        borderColor: isActive ? '#147D72' : '#E7EAEE',
                      }}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="text-[13px] font-semibold text-text-primary block">
                Or Enter Custom Number of Leads
              </label>
              <Input
                type="number"
                min={1}
                placeholder="Type any exact number (e.g. 180, 450, 925)..."
                value={assignAllFlag ? unassignedCount : assignCount}
                onChange={(e) => {
                  setAssignAllFlag(false);
                  setAssignCount(e.target.value);
                }}
              />
            </div>

            <Button
              type="submit"
              disabled={assigning || unassignedCount === 0 || reps.length === 0}
              className="w-full h-11 rounded-xl"
            >
              {assigning ? (
                <span>Allocating Leads in Database...</span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>
                    Allocate{' '}
                    {assignAllFlag
                      ? `All ${formatNumber(unassignedCount)}`
                      : formatNumber(
                          Math.min(
                            Number(assignCount) || 0,
                            unassignedCount || Number(assignCount) || 0
                          )
                        )}{' '}
                    Leads Now
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
        </PageCard>

        {/* Current Workloads Table */}
        <div className="lg:col-span-2">
          <DataTable
            headers={[
              { label: 'Sales Representative (Click for Daily Profile)' },
              { label: 'Assigned', align: 'center' },
              { label: 'Pending', align: 'center' },
              { label: 'Calls Made', align: 'center' },
              { label: 'Confirmed', align: 'center' },
              { label: 'Quick Assign', align: 'right' },
            ]}
            isEmpty={!loading && reps.length === 0}
            emptyState={
              <span className="text-sm text-text-muted">
                No active sales representatives found. Add an employee in the Sales Team directory.
              </span>
            }
          >
            {reps.map((rep) => (
              <DataTableRow
                key={rep.id}
                onClick={() => router.push(`/admin/employees/${rep.id}`)}
              >
                <DataTableCell>
                  <div className="flex items-center" style={{ gap: '12px' }}>
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarFallback className="bg-primary-50 text-primary-700 text-xs font-bold">
                        {getInitials(rep.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <Link
                        href={`/admin/employees/${rep.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-bold text-text-primary hover:text-primary-600 text-[13.5px] flex items-center gap-1.5"
                      >
                        <span>{rep.name}</span>
                        <ExternalLink className="w-3 h-3 text-text-muted" />
                      </Link>
                      <span className="text-[12px] text-text-muted">
                        {rep.empId} • {rep.department || 'Sales'}
                      </span>
                    </div>
                  </div>
                </DataTableCell>
                <DataTableCell align="center" className="font-bold text-text-primary tabular-nums text-[14px]">
                  {formatNumber(rep.activeLeads)}
                </DataTableCell>
                <DataTableCell align="center" className="font-bold text-warning tabular-nums text-[14px]">
                  {formatNumber(rep.pendingLeads)}
                </DataTableCell>
                <DataTableCell align="center" className="font-bold text-accent-blue tabular-nums text-[14px]">
                  {formatNumber(rep.callsMade)}
                </DataTableCell>
                <DataTableCell align="center" className="text-success font-bold tabular-nums text-[14px]">
                  {formatNumber(rep.confirmedDeals)} ({rep.conversionRate}%)
                </DataTableCell>
                <DataTableCell align="right">
                  <div
                    className="flex items-center justify-end"
                    style={{ gap: '6px' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      size="xs"
                      variant="outline"
                      disabled={assigning || unassignedCount === 0}
                      onClick={() => executeAssignment('single', rep.id, 100, false)}
                    >
                      +100 Leads
                    </Button>
                    <Button
                      size="xs"
                      variant="default"
                      onClick={() => router.push(`/admin/employees/${rep.id}`)}
                    >
                      Profile
                    </Button>
                  </div>
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTable>
        </div>
      </div>
    </AdminPageContainer>
  );
}
