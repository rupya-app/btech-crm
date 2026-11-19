'use client';

import React, { useState, useEffect } from 'react';
import { KeyRound } from 'lucide-react';
import {
  AdminPageContainer,
  PageHeader,
  PageCard,
  PageCardHeader,
  SuccessNotice,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getInitials } from '@/lib/utils';

export default function EmployeeProfilePage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [empId, setEmpId] = useState('');
  const [department, setDepartment] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        const data = await res.json();
        if (data.profile) {
          setFullName(data.profile.full_name || '');
          setEmail(data.profile.email || '');
          setPhone(data.profile.phone || '');
          setEmpId(data.profile.employee_id || 'EMP');
          setDepartment(data.profile.department || 'Sales');
        }
      } catch {}
    };
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedNotice(false);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phone }),
      });
      if (res.ok) {
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPageContainer maxWidth>
      <PageHeader
        title="My Account Profile"
        description="Manage your personal contact info and security settings in Supabase."
      />

      {savedNotice && (
        <SuccessNotice message="Profile changes saved to database!" />
      )}

      <PageCard className="space-y-6">
        <div
          className="flex items-center border-b border-border-light"
          style={{ gap: '16px', paddingBottom: '20px', marginBottom: '20px' }}
        >
          <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-700 font-bold text-lg flex items-center justify-center shadow-xs shrink-0">
            {getInitials(fullName || 'SE')}
          </div>
          <div>
            <h3 className="text-[18px] font-bold text-text-primary">{fullName || 'Loading...'}</h3>
            <span className="text-[13px] text-text-muted mt-0.5 block">
              Employee ID: <strong className="text-text-primary">{empId}</strong> • {department}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Label className="text-[13px] font-medium text-text-primary">Full Name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="max-w-md"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Label className="text-[13px] font-medium text-text-primary">
              Email Address (Managed by Admin)
            </Label>
            <Input value={email} disabled className="max-w-md" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Label className="text-[13px] font-medium text-text-primary">Phone Number</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </Button>
          </div>
        </form>
      </PageCard>

      {/* Security Section */}
      <PageCard>
        <PageCardHeader
          title="Security & Password"
          description="Need to change your account password? Update your Supabase Auth password anytime."
          icon={KeyRound}
        />
        <Button asChild variant="outline">
          <a href="/change-password">Change Password</a>
        </Button>
      </PageCard>
    </AdminPageContainer>
  );
}
