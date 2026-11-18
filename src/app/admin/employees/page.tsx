'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Mail,
  Phone,
  KeyRound,
  ShieldAlert,
  Building2,
  RefreshCw,
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
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create Employee Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDepartment, setNewDepartment] = useState('Enterprise Sales');
  const [newJobTitle, setNewJobTitle] = useState('Sales Executive');
  const [generatedEmpId, setGeneratedEmpId] = useState('');
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

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
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim()) return;

    setCreating(true);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newFullName.trim(),
          email: newEmail.trim(),
          phone: newPhone.trim(),
          department: newDepartment,
          jobTitle: newJobTitle,
          employeeId: generatedEmpId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.employee) {
        setEmployees((prev) => [data.employee, ...prev]);
      }

      setNotice(`Employee ${newFullName} created successfully! Employee ID: ${generatedEmpId}`);
      setIsCreateOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create employee');
    } finally {
      setCreating(false);
    }
  };

  const toggleActiveStatus = (id: string) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id ? { ...emp, is_active: !emp.is_active } : emp
      )
    );
    setNotice('Employee status updated. Session permissions recalculated.');
  };

  const filtered = employees.filter(
    (e) =>
      e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.employee_id.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Employee Directory & Credentials
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Manage sales team credentials, role permissions, unique employee IDs, and workspace access.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="text-xs h-9 bg-primary-600 hover:bg-primary-700 text-white shadow-xs"
        >
          <UserPlus className="w-3.5 h-3.5 mr-1.5" />
          <span>Add New Employee</span>
        </Button>
      </div>

      {notice && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-success-bg border border-success/30 text-success text-xs font-semibold animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-border shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            type="search"
            placeholder="Search by name, employee ID, email, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-surface-muted/50 border-border rounded-lg"
          />
        </div>
        <span className="text-xs text-text-muted">
          Total Employees: <strong>{employees.length}</strong>
        </span>
      </div>

      {/* Employees Table */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-muted border-b border-border text-text-secondary font-semibold">
              <tr>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-3">Full Name</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">Department & Role</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-primary-700 tabular-nums">
                    {emp.employee_id}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-7 w-7 border border-border">
                        <AvatarFallback className="bg-primary-50 text-primary-700 text-[10px] font-bold">
                          {getInitials(emp.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-text-primary">
                          {emp.full_name}
                        </span>
                        <span className="text-[10px] text-text-muted">{emp.job_title}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col">
                      <span className="text-text-secondary">{emp.email}</span>
                      {emp.phone && (
                        <span className="text-[10px] text-text-muted tabular-nums mt-0.5">
                          {emp.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-text-secondary">
                    {emp.department || 'Sales'}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {emp.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-bg text-success text-[10px] font-semibold border border-success/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-danger-bg text-danger text-[10px] font-semibold border border-danger/30">
                        <XCircle className="w-3 h-3" />
                        Deactivated
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-text-muted tabular-nums">
                    {formatDate(emp.created_at)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-text-muted hover:text-text-primary"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 text-xs shadow-md">
                        <DropdownMenuItem
                          onClick={() => toggleActiveStatus(emp.id)}
                          className={emp.is_active ? 'text-danger' : 'text-success'}
                        >
                          {emp.is_active ? 'Deactivate Account' : 'Reactivate Account'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => alert(`Password reset link sent to ${emp.email}`)}
                        >
                          Reset Password
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-text-primary">
              Create New Employee Account
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted">
              Generates a unique employee ID and provisional login credentials.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Generated Employee ID</Label>
              <Input
                value={generatedEmpId}
                disabled
                className="text-xs bg-surface-muted font-bold text-primary-700"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Full Name *</Label>
              <Input
                placeholder="e.g. Rahul Varma"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Corporate Email Address *</Label>
              <Input
                type="email"
                placeholder="e.g. rahul.v@company.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Mobile Phone Number</Label>
              <Input
                placeholder="e.g. +91 98200 12345"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Department</Label>
                <Input
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Job Title</Label>
                <Input
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-muted border border-border text-[11px] text-text-muted leading-relaxed">
              <strong>First Login Policy:</strong> The employee will log in using their Employee ID (<strong>{generatedEmpId}</strong>) and will be prompted to set a permanent password upon first access.
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creating}
                size="sm"
                className="text-xs bg-primary-600 hover:bg-primary-700 text-white"
              >
                {creating ? 'Creating Account...' : 'Generate & Activate'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
