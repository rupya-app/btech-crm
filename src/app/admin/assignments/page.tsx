'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  UserPlus,
  Users,
  Layers,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shuffle,
  ShieldCheck,
  Scale,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials, formatNumber } from '@/lib/utils';

interface RepWorkload {
  id: string;
  name: string;
  empId: string;
  activeLeads: number;
  confirmedDeals: number;
  conversionRate: number;
}

export default function AdminAssignmentsPage() {
  const [reps, setReps] = useState<RepWorkload[]>([
    { id: 'emp-1', name: 'Priya Sharma', empId: 'EMP1001', activeLeads: 48, confirmedDeals: 18, conversionRate: 15.0 },
    { id: 'emp-2', name: 'Vikram Patel', empId: 'EMP1002', activeLeads: 54, confirmedDeals: 14, conversionRate: 12.7 },
    { id: 'emp-3', name: 'Rahul Varma', empId: 'EMP1003', activeLeads: 36, confirmedDeals: 11, conversionRate: 11.5 },
    { id: 'emp-4', name: 'Ananya Roy', empId: 'EMP1004', activeLeads: 28, confirmedDeals: 8, conversionRate: 10.0 },
  ]);

  const [selectedRep, setSelectedRep] = useState<string>('emp-1');
  const [distributionMode, setDistributionMode] = useState<'single' | 'round_robin' | 'workload'>('workload');
  const [unassignedCount, setUnassignedCount] = useState(4130);
  const [assignCount, setAssignCount] = useState('50');
  const [assigning, setAssigning] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleExecuteAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(assignCount, 10);
    if (!count || count <= 0) return;

    setAssigning(true);
    setTimeout(() => {
      setAssigning(false);
      setUnassignedCount((prev) => Math.max(0, prev - count));

      if (distributionMode === 'single') {
        const repName = reps.find((r) => r.id === selectedRep)?.name || 'Employee';
        setReps((prev) =>
          prev.map((r) => (r.id === selectedRep ? { ...r, activeLeads: r.activeLeads + count } : r))
        );
        setSuccessNotice(`Successfully allocated ${count} leads directly to ${repName}.`);
      } else {
        const perRep = Math.floor(count / reps.length);
        setReps((prev) => prev.map((r) => ({ ...r, activeLeads: r.activeLeads + perRep })));
        setSuccessNotice(
          `Successfully distributed ${count} leads evenly among ${reps.length} sales representatives.`
        );
      }
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Lead Distribution & Workload Balancing
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Distribute unassigned leads individually, in bulk round-robin, or via workload-balanced allocation.
        </p>
      </div>

      {successNotice && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-success-bg border border-success/30 text-success text-xs font-semibold animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs">
          <span className="text-xs font-medium text-text-secondary">Unassigned Leads Available</span>
          <div className="mt-2 text-3xl font-bold text-primary-700 tabular-nums">
            {formatNumber(unassignedCount)}
          </div>
          <span className="text-[11px] text-text-muted mt-1 block">Awaiting allocation to sales pipeline</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs">
          <span className="text-xs font-medium text-text-secondary">Active Sales Representatives</span>
          <div className="mt-2 text-3xl font-bold text-text-primary tabular-nums">
            {reps.length}
          </div>
          <span className="text-[11px] text-text-muted mt-1 block">Eligible to receive lead allocations</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs">
          <span className="text-xs font-medium text-text-secondary">Self-Selection Lead Pool</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-success tabular-nums">Active</span>
            <span className="text-[11px] bg-success-bg text-success px-2 py-0.5 rounded-full font-semibold">
              Enabled
            </span>
          </div>
          <span className="text-[11px] text-text-muted mt-1 block">Atomic claiming enabled for sales team</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation Form */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-5">
          <h2 className="text-sm font-semibold text-text-primary border-b border-border-light pb-2.5 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary-600" />
            <span>Lead Allocation Engine</span>
          </h2>

          <form onSubmit={handleExecuteAssignment} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-primary">
                Distribution Strategy
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'workload', label: 'Balanced', icon: Scale },
                  { id: 'round_robin', label: 'Equal', icon: Shuffle },
                  { id: 'single', label: 'Direct', icon: UserPlus },
                ].map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setDistributionMode(mode.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center justify-center gap-1.5 transition-all ${
                        distributionMode === mode.id
                          ? 'bg-primary-50 text-primary-700 border-primary-300 shadow-2xs font-semibold'
                          : 'bg-surface-muted text-text-secondary border-border hover:bg-surface'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {distributionMode === 'single' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-primary">
                  Select Sales Representative
                </label>
                <Select value={selectedRep} onValueChange={(val) => setSelectedRep(val || '')}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Choose rep" />
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

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-primary">
                Batch Size (Number of Leads to Allocate)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['25', '50', '100', '250'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAssignCount(val)}
                    className={`py-1.5 rounded-lg border text-xs font-semibold tabular-nums transition-colors ${
                      assignCount === val
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-surface-muted text-text-secondary border-border hover:bg-surface'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={assigning || unassignedCount === 0}
              className="w-full text-xs bg-primary-600 hover:bg-primary-700 text-white h-10 mt-2 shadow-xs"
            >
              {assigning ? (
                <span>Executing Batch Distribution...</span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span>Allocate {assignCount} Leads Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Current Workloads Table */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-2xl border border-border shadow-xs">
          <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center justify-between">
            <span>Sales Representative Workloads & Capacity</span>
            <span className="text-[11px] text-text-muted font-normal">Real-time capacity tracking</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-muted border-b border-border text-text-secondary font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Sales Rep</th>
                  <th className="py-2.5 px-3 text-center">Active Queue</th>
                  <th className="py-2.5 px-3 text-center">Confirmed Deals</th>
                  <th className="py-2.5 px-3 text-center">Conversion</th>
                  <th className="py-2.5 px-3">Workload Bar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {reps.map((rep) => {
                  const pct = Math.min(100, Math.round((rep.activeLeads / 80) * 100));
                  return (
                    <tr key={rep.id} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7 border border-border">
                            <AvatarFallback className="bg-primary-50 text-primary-700 text-[10px] font-bold">
                              {getInitials(rep.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-text-primary">{rep.name}</span>
                            <span className="text-[10px] text-text-muted">{rep.empId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-text-primary tabular-nums">
                        {rep.activeLeads}
                      </td>
                      <td className="py-3 px-3 text-center text-success font-bold tabular-nums">
                        {rep.confirmedDeals}
                      </td>
                      <td className="py-3 px-3 text-center tabular-nums text-text-secondary font-medium">
                        {rep.conversionRate}%
                      </td>
                      <td className="py-3 px-3 w-40">
                        <div className="space-y-1">
                          <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden border border-border">
                            <div
                              className="h-full bg-primary-600 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-text-muted block text-right">
                            {pct}% capacity
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
