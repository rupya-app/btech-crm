'use client';

import React, { useState } from 'react';
import { User, Mail, Phone, Building2, KeyRound, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EmployeeProfilePage() {
  const [fullName, setFullName] = useState('Sales Executive');
  const [email, setEmail] = useState('employee@digitalcrm.com');
  const [phone, setPhone] = useState('+91 98201 55667');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          My Account Profile
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Manage your personal contact info and security settings.
        </p>
      </div>

      {savedNotice && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-success-bg border border-success/30 text-success text-xs font-semibold animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-5">
        <div className="flex items-center gap-4 border-b border-border-light pb-5">
          <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-700 font-bold text-lg flex items-center justify-center">
            SE
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">{fullName}</h3>
            <span className="text-xs text-text-muted">Employee ID: <strong>EMP1001</strong> • Enterprise Sales</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Full Name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Email Address (Managed by Admin)</Label>
            <Input
              value={email}
              disabled
              className="text-xs bg-surface-muted"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Phone Number</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="text-xs bg-primary-600 hover:bg-primary-700 text-white"
            >
              Save Profile
            </Button>
          </div>
        </form>
      </div>

      {/* Security Section */}
      <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-3">
        <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-primary-600" />
          <span>Security & Password</span>
        </h3>
        <p className="text-xs text-text-muted leading-relaxed">
          Need to change your account password? You can update it anytime using the security portal.
        </p>
        <Button asChild variant="outline" size="sm" className="text-xs">
          <a href="/change-password">Change Password</a>
        </Button>
      </div>
    </div>
  );
}
