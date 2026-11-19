'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  Search,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  AlertCircle,
  ExternalLink,
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { generateEmployeeId, getInitials, formatDate } from '@/lib/utils';
import {
  AdminPageContainer,
  PageHeader,
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
  created_at: string;
}

export default function AdminEmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const toggleActiveStatus = async (emp: EmployeeItem) => {
    try {
      const nextStatus = !emp.is_active;
      const res = await fetch('/api/employees', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: emp.id, is_active: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEmployees((prev) =>
        prev.map((item) =>
          item.id === emp.id ? { ...item, is_active: nextStatus } : item
        )
      );
      setNotice(
        `Employee ${emp.full_name} (${emp.employee_id}) ${
          nextStatus ? 'reactivated' : 'deactivated'
        } in database.`
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update employee status');
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

  const filtered = employees.filter(
    (e) =>
      e.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.employee_id?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase()) ||
      e.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminPageContainer>
      <PageHeader
        title="Sales Team Directory & Credentials"
        description="Manage sales team credentials, role permissions, unique employee IDs, and workspace access."
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

      {/* Search Bar */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-2xl border border-border shadow-xs"
        style={{ padding: '18px 22px', gap: '16px' }}
      >
        <div
          className="flex items-center flex-1 max-w-md rounded-xl border border-border bg-[#F8FAFB] focus-within:bg-white focus-within:border-primary-500 transition-all"
          style={{ padding: '0 14px', height: '42px', gap: '10px' }}
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
        <span className="text-[13px] text-text-muted font-medium">
          Total Employees: <strong className="text-text-primary font-semibold">{employees.length}</strong>
        </span>
      </div>

      {/* Employees Table */}
      <DataTable
        headers={[
          { label: 'Employee ID' },
          { label: 'Full Name' },
          { label: 'Contact' },
          { label: 'Department & Role' },
          { label: 'Status', align: 'center' },
          { label: 'Joined Date' },
          { label: 'Actions', align: 'right' },
        ]}
        isEmpty={!loading && filtered.length === 0}
        emptyState={
          <span className="text-sm text-text-muted">
            No employees found in database. Click &ldquo;Add New Employee&rdquo; to create one.
          </span>
        }
      >
        {filtered.map((emp) => (
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
                  <span className="text-[12px] text-text-muted">{emp.job_title}</span>
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
            <DataTableCell className="text-text-secondary font-medium">
              {emp.department || 'Sales'}
            </DataTableCell>
            <DataTableCell align="center">
              {emp.is_active ? (
                <span
                  className="inline-flex items-center rounded-full bg-success-bg text-success text-xs font-semibold border border-success/30"
                  style={{ padding: '3px 10px', gap: '5px' }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Active</span>
                </span>
              ) : (
                <span
                  className="inline-flex items-center rounded-full bg-danger-bg text-danger text-xs font-semibold border border-danger/30"
                  style={{ padding: '3px 10px', gap: '5px' }}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Deactivated</span>
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
                  <span>View Daily Log & Stats</span>
                </Button>
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
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => router.push(`/admin/employees/${emp.id}`)}
                    >
                      View Profile & Work History
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => toggleActiveStatus(emp)}
                      className={emp.is_active ? 'text-danger' : 'text-success'}
                    >
                      {emp.is_active ? 'Deactivate Account' : 'Reactivate Account'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleResetPassword(emp)}>
                      Reset Password to Default
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTable>

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
