'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  Search,
  CheckCircle2,
  XCircle,
  PauseCircle,
  PlayCircle,
  MoreHorizontal,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { generateEmployeeId, getInitials, formatDate, formatNumber } from '@/lib/utils';
import {
  AdminPageContainer,
  PageHeader,
  FilterTabs,
  DataTable,
  DataTableRow,
  DataTableCell,
  SuccessNotice,
} from '@/components/common';

interface EmployeeItem {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  phone: string;
  department: string;
  job_title: string;
  is_active: boolean;
  account_status?: 'active' | 'paused' | 'deactivated';
  active_leads_count?: number;
  created_at: string;
}

export default function AdminEmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'deactivated'>('all');

  // Create Employee Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('Password@123');
  const [newDepartment, setNewDepartment] = useState('Enterprise Sales');
  const [newJobTitle, setNewJobTitle] = useState('Sales Executive');
  const [generatedEmpId, setGeneratedEmpId] = useState('');
  const [creating, setCreating] = useState(false);

  // Permanent Deactivation Confirmation Modal
  const [deactivateTarget, setDeactivateTarget] = useState<EmployeeItem | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  const [notice, setNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/employees');
      const data = await res.json();
      setEmployees(data.employees || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setGeneratedEmpId(generateEmployeeId('EMP'));
    setNewFullName('');
    setNewEmail('');
    setNewPhone('');
    setNewPassword('Password@123');
    setErrorMsg(null);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim()) return;

    setCreating(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newFullName.trim(),
          email: newEmail.trim(),
          phone: newPhone.trim(),
          password: newPassword,
          department: newDepartment,
          jobTitle: newJobTitle,
          employeeId: generatedEmpId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.employee) {
        setEmployees((prev) => {
          const exists = prev.some((item) => item.id === data.employee.id);
          return exists
            ? prev.map((item) => (item.id === data.employee.id ? data.employee : item))
            : [data.employee, ...prev];
        });
      }

      setNotice(
        `Employee ${newFullName} created in Supabase! Login ID: ${generatedEmpId} | Password: ${newPassword}`
      );
      setIsCreateOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create employee');
    } finally {
      setCreating(false);
    }
  };

  const handlePauseOrResume = async (emp: EmployeeItem, targetAction: 'pause' | 'resume') => {
    setErrorMsg(null);
    setNotice(null);
    try {
      const res = await fetch('/api/employees', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: emp.id, action: targetAction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEmployees((prev) =>
        prev.map((item) =>
          item.id === emp.id
            ? {
                ...item,
                is_active: targetAction === 'resume',
                account_status: targetAction === 'resume' ? 'active' : 'paused',
              }
            : item
        )
      );
      setNotice(data.message);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update employee status');
    }
  };

  const handleConfirmPermanentDeactivate = async () => {
    if (!deactivateTarget) return;
    setDeactivating(true);
    setErrorMsg(null);
    setNotice(null);
    try {
      const res = await fetch('/api/employees', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deactivateTarget.id, action: 'deactivate' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEmployees((prev) =>
        prev.map((item) =>
          item.id === deactivateTarget.id
            ? {
                ...item,
                is_active: false,
                account_status: 'deactivated',
                active_leads_count: 0,
              }
            : item
        )
      );
      setNotice(data.message);
      setDeactivateTarget(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to deactivate employee');
    } finally {
      setDeactivating(false);
    }
  };

  const handleResetPassword = async (emp: EmployeeItem) => {
    try {
      const res = await fetch('/api/employees', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: emp.id, newPassword: 'Password@123' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNotice(
        `Password for ${emp.full_name} (${emp.employee_id}) has been reset to: Password@123`
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password');
    }
  };

  const getEmpStatus = (emp: EmployeeItem): 'active' | 'paused' | 'deactivated' => {
    if (emp.account_status) return emp.account_status;
    return emp.is_active ? 'active' : 'deactivated';
  };

  const counts = {
    all: employees.length,
    active: employees.filter((e) => getEmpStatus(e) === 'active').length,
    paused: employees.filter((e) => getEmpStatus(e) === 'paused').length,
    deactivated: employees.filter((e) => getEmpStatus(e) === 'deactivated').length,
  };

  const filtered = employees.filter((e) => {
    const st = getEmpStatus(e);
    if (statusFilter !== 'all' && st !== statusFilter) return false;
    return (
      e.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.employee_id?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase()) ||
      e.department?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <AdminPageContainer>
      <PageHeader
        title="Sales Team Directory & Lifecycle Control"
        description="Manage sales representative credentials, pause portal access temporarily, or permanently deactivate accounts with automatic lead reversion to the Unassigned Pool."
        actions={
          <Button onClick={openCreateModal}>
            <UserPlus className="w-4 h-4" />
            <span>Add New Employee</span>
          </Button>
        }
      />

      {notice && <SuccessNotice message={notice} />}

      {errorMsg && (
        <div
          className="flex items-center gap-3 rounded-xl bg-danger-bg border border-danger/30 text-danger text-[13px] font-semibold"
          style={{ padding: '14px 18px' }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Status Filter Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between" style={{ gap: '16px' }}>
        <FilterTabs
          tabs={[
            { id: 'all', label: `All Team (${counts.all})` },
            { id: 'active', label: `Active (${counts.active})` },
            { id: 'paused', label: `Paused (${counts.paused})` },
            { id: 'deactivated', label: `Deactivated (${counts.deactivated})` },
          ]}
          activeTab={statusFilter}
          onTabChange={(id) => setStatusFilter(id as any)}
        />

        <div
          className="flex items-center flex-1 max-w-md rounded-xl border border-border bg-white focus-within:border-primary-500 transition-all shadow-xs"
          style={{ padding: '0 14px', height: '44px', gap: '10px' }}
        >
          <Search className="w-4 h-4 text-text-muted shrink-0" />
          <input
            type="search"
            placeholder="Search by name, employee ID, email, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-full bg-transparent text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>
      </div>

      {/* Employees Table */}
      <DataTable
        headers={[
          { label: 'Employee ID' },
          { label: 'Full Name (Click for Daily History)' },
          { label: 'Contact' },
          { label: 'Active Leads', align: 'center' },
          { label: 'Account Status', align: 'center' },
          { label: 'Joined Date' },
          { label: 'Actions', align: 'right' },
        ]}
        isEmpty={!loading && filtered.length === 0}
        emptyState={
          <span className="text-sm text-text-muted">
            No employees found matching this filter.
          </span>
        }
      >
        {filtered.map((emp) => {
          const st = getEmpStatus(emp);
          return (
            <DataTableRow
              key={emp.id}
              onClick={() => router.push(`/admin/employees/${emp.id}`)}
            >
              <DataTableCell className="font-bold text-primary-700 tabular-nums">
                <Link
                  href={`/admin/employees/${emp.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="hover:underline"
                >
                  {emp.employee_id}
                </Link>
              </DataTableCell>
              <DataTableCell>
                <div className="flex items-center" style={{ gap: '12px' }}>
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarFallback className="bg-primary-50 text-primary-700 text-xs font-bold">
                      {getInitials(emp.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <Link
                      href={`/admin/employees/${emp.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-bold text-text-primary hover:text-primary-600 flex items-center gap-1.5"
                    >
                      <span>{emp.full_name}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-text-muted" />
                    </Link>
                    <span className="text-[12px] text-text-muted">
                      {emp.department || 'Sales'} • {emp.job_title}
                    </span>
                  </div>
                </div>
              </DataTableCell>
              <DataTableCell>
                <div className="flex flex-col">
                  <span className="text-text-secondary font-medium">{emp.email}</span>
                  {emp.phone && (
                    <span className="text-[12px] text-text-muted tabular-nums">
                      {emp.phone}
                    </span>
                  )}
                </div>
              </DataTableCell>
              <DataTableCell align="center">
                {st === 'deactivated' ? (
                  <span className="text-xs text-text-muted font-medium">
                    0 (Reverted to Pool)
                  </span>
                ) : (
                  <span className="font-bold text-text-primary tabular-nums text-[14px]">
                    {formatNumber(emp.active_leads_count || 0)}
                  </span>
                )}
              </DataTableCell>
              <DataTableCell align="center">
                {st === 'active' && (
                  <span
                    className="inline-flex items-center rounded-full bg-success-bg text-success text-xs font-semibold border border-success/30"
                    style={{ padding: '4px 11px', gap: '6px' }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </span>
                )}
                {st === 'paused' && (
                  <span
                    className="inline-flex items-center rounded-full bg-warning-bg text-warning text-xs font-semibold border border-warning/30"
                    style={{ padding: '4px 11px', gap: '6px' }}
                  >
                    <PauseCircle className="w-3.5 h-3.5" />
                    <span>Paused (Portal Locked)</span>
                  </span>
                )}
                {st === 'deactivated' && (
                  <span
                    className="inline-flex items-center rounded-full bg-danger-bg text-danger text-xs font-semibold border border-danger/30"
                    style={{ padding: '4px 11px', gap: '6px' }}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Deactivated (History Kept)</span>
                  </span>
                )}
              </DataTableCell>
              <DataTableCell className="text-text-muted tabular-nums">
                {formatDate(emp.created_at)}
              </DataTableCell>
              <DataTableCell align="right">
                <div
                  className="flex items-center justify-end"
                  style={{ gap: '8px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => router.push(`/admin/employees/${emp.id}`)}
                  >
                    <span>{st === 'deactivated' ? 'View History' : 'Daily Log & Stats'}</span>
                  </Button>

                  {st === 'active' && (
                    <Button
                      size="xs"
                      variant="outline"
                      className="text-warning border-warning/30 hover:bg-warning-bg"
                      onClick={() => handlePauseOrResume(emp, 'pause')}
                    >
                      <PauseCircle className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </Button>
                  )}

                  {st === 'paused' && (
                    <Button
                      size="xs"
                      variant="outline"
                      className="text-success border-success/30 hover:bg-success-bg"
                      onClick={() => handlePauseOrResume(emp, 'resume')}
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Activate</span>
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-text-muted hover:text-text-primary"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/employees/${emp.id}`)}
                      >
                        View Daily Work Log & History
                      </DropdownMenuItem>

                      {st === 'active' && (
                        <>
                          <DropdownMenuItem onClick={() => handlePauseOrResume(emp, 'pause')}>
                            Pause Portal Access (Temporary)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetPassword(emp)}>
                            Reset Password to Default
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeactivateTarget(emp)}
                            className="text-danger"
                          >
                            Deactivate Permanently & Revert Leads
                          </DropdownMenuItem>
                        </>
                      )}

                      {st === 'paused' && (
                        <>
                          <DropdownMenuItem
                            onClick={() => handlePauseOrResume(emp, 'resume')}
                            className="text-success"
                          >
                            Resume / Activate Portal Access
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetPassword(emp)}>
                            Reset Password to Default
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeactivateTarget(emp)}
                            className="text-danger"
                          >
                            Deactivate Permanently & Revert Leads
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </DataTableCell>
            </DataTableRow>
          );
        })}
      </DataTable>

      {/* Permanent Deactivation & Automatic Lead Reversion Modal */}
      <Dialog
        open={Boolean(deactivateTarget)}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-danger">
              <ShieldAlert className="w-5 h-5 text-danger" />
              <span>Permanently Deactivate {deactivateTarget?.full_name}?</span>
            </DialogTitle>
            <DialogDescription>
              This action permanently revokes portal access for{' '}
              <strong>
                {deactivateTarget?.full_name} ({deactivateTarget?.employee_id})
              </strong>
              . A deactivated account cannot be made active again.
            </DialogDescription>
          </DialogHeader>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              className="rounded-xl bg-warning-bg border border-warning/30 text-warning text-[13px] leading-relaxed"
              style={{ padding: '14px 16px' }}
            >
              <strong className="font-bold block mb-1">
                1. Automatic Lead Reversion ({formatNumber(deactivateTarget?.active_leads_count || 0)} Active Leads):
              </strong>
              All{' '}
              <strong>{formatNumber(deactivateTarget?.active_leads_count || 0)} leads</strong>{' '}
              currently assigned to {deactivateTarget?.full_name} will be automatically reverted back to the{' '}
              <strong>Unassigned Pool</strong> so you can assign them to other active sales representatives.
            </div>

            <div
              className="rounded-xl bg-[#F8FAFB] border border-border text-[13px] text-text-secondary leading-relaxed"
              style={{ padding: '14px 16px' }}
            >
              <strong className="text-text-primary font-bold block mb-1">
                2. Complete History Preserved:
              </strong>
              Their profile will remain under the <strong>Deactivated</strong> tab. None of their daily work logs, call records, stage markings, or remarks will be deleted.
              <br />
              <span className="text-xs text-text-muted mt-1 block">
                Tip: If you only want to block their portal temporarily and activate them again later, click <strong>Cancel</strong> and use <strong>Pause Portal Access</strong> instead.
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeactivateTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deactivating}
              onClick={handleConfirmPermanentDeactivate}
              style={{ backgroundColor: '#C74747', color: '#FFFFFF' }}
            >
              {deactivating
                ? 'Reverting Leads & Deactivating...'
                : 'Confirm Permanent Deactivation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Employee Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>Create New Employee Account</DialogTitle>
            <DialogDescription>
              Creates a live Supabase Auth account and assigns a unique Employee ID for your sales representative.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Label className="text-[13px] font-semibold text-text-primary">
                System Generated Employee ID
              </Label>
              <div
                className="flex items-center justify-between rounded-xl bg-primary-50/80 border border-primary-200"
                style={{ padding: '10px 14px' }}
              >
                <span className="text-[14px] font-mono font-bold text-primary-800">
                  {generatedEmpId}
                </span>
                <span
                  className="text-[11px] font-semibold text-primary-700 bg-white rounded-md border border-primary-200"
                  style={{ padding: '2px 8px' }}
                >
                  Auto-Assigned
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Label className="text-[13px] font-semibold text-text-primary">
                Full Name *
              </Label>
              <Input
                placeholder="e.g. Rahul Varma"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Label className="text-[13px] font-semibold text-text-primary">
                  Corporate Email Address *
                </Label>
                <Input
                  type="email"
                  placeholder="e.g. rahul.v@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Label className="text-[13px] font-semibold text-text-primary">
                  Initial Password *
                </Label>
                <Input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Label className="text-[13px] font-semibold text-text-primary">
                Mobile Phone Number
              </Label>
              <Input
                placeholder="e.g. +91 98200 12345"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2" style={{ gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Label className="text-[13px] font-semibold text-text-primary">
                  Department
                </Label>
                <Input
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Label className="text-[13px] font-semibold text-text-primary">
                  Job Title
                </Label>
                <Input
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                />
              </div>
            </div>

            <div
              className="rounded-xl bg-[#F8FAFB] border border-border text-[12px] text-text-muted leading-relaxed"
              style={{ padding: '12px 14px' }}
            >
              <strong className="text-text-primary font-semibold">Login Credentials:</strong> The employee can sign in immediately using Employee ID <strong>{generatedEmpId}</strong> (or email) and password <strong>{newPassword}</strong>.
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? 'Creating Account...' : 'Generate & Activate'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminPageContainer>
  );
}
