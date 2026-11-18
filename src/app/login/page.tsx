'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Lock,
  Mail,
  UserCheck,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'admin' | 'employee'>('admin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!identifier.trim() || !password) {
      setError('Please provide your login credentials.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
          role: activeTab,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      setSuccess('Login successful! Redirecting to dashboard...');
      setTimeout(() => {
        router.push(data.redirectTo || (activeTab === 'admin' ? '/admin/dashboard' : '/employee/dashboard'));
        router.refresh();
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to authentication service.');
    } finally {
      setLoading(false);
    }
  };

  // Quick preset helper for development convenience
  const fillPreset = (type: 'admin' | 'employee') => {
    if (type === 'admin') {
      setActiveTab('admin');
      setIdentifier('admin@digitalcrm.com');
      setPassword('Password@123');
    } else {
      setActiveTab('employee');
      setIdentifier('EMP1001');
      setPassword('Password@123');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-[#F5F6F8] via-[#EDF3F2] to-[#E3EFEA] p-4 sm:p-6 relative overflow-hidden">
      {/* Background Decorative Circles / Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary-200/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-accent-blueSoft/50 blur-3xl pointer-events-none" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
        className="w-full max-w-[440px] z-10"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-700 to-primary-500 shadow-md flex items-center justify-center text-white mb-3">
            <Briefcase className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Digital Sales CRM
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Enterprise Lead Management & Distribution Platform
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface/90 backdrop-blur-xl rounded-2xl border border-border shadow-xl p-6 sm:p-8">
          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 bg-surface-muted rounded-xl mb-6 border border-border-light">
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setIdentifier('');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'admin'
                  ? 'bg-surface text-primary-700 shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('employee');
                setIdentifier('');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'employee'
                  ? 'bg-surface text-primary-700 shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Employee Login</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Feedback alert */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-danger-bg text-danger border border-danger/20 text-xs"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2.5 p-3 rounded-lg bg-success-bg text-success border border-success/20 text-xs font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Identifier Field */}
            <div className="space-y-1.5">
              <Label htmlFor="identifier" className="text-xs font-medium text-text-primary">
                {activeTab === 'admin' ? 'Admin Email' : 'Employee ID'}
              </Label>
              <div className="relative">
                {activeTab === 'admin' ? (
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                ) : (
                  <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                )}
                <Input
                  id="identifier"
                  type={activeTab === 'admin' ? 'email' : 'text'}
                  placeholder={
                    activeTab === 'admin' ? 'admin@company.com' : 'e.g. EMP1001'
                  }
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-9 h-10 text-xs bg-surface border-border focus:border-primary-500 rounded-lg"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium text-text-primary">
                  Password
                </Label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    setError(
                      activeTab === 'admin'
                        ? 'Contact database super-admin or use recovery keys.'
                        : 'Please ask your CRM administrator to reset your employee password.'
                    );
                  }}
                  className="text-[11px] text-primary-600 hover:text-primary-700 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9 h-10 text-xs bg-surface border-border focus:border-primary-500 rounded-lg"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 mt-2 bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 text-white font-medium text-xs rounded-lg shadow-sm transition-all"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Sign In to {activeTab === 'admin' ? 'Admin CRM' : 'Sales Workspace'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </Button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 pt-5 border-t border-border-light text-center">
            <p className="text-[11px] text-text-muted mb-2.5 font-medium">
              Demo Quick-Fill Presets:
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fillPreset('admin')}
                className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-primary-50 text-primary-700 border border-primary-200/60 hover:bg-primary-100 transition-colors"
              >
                Admin Demo
              </button>
              <button
                type="button"
                onClick={() => fillPreset('employee')}
                className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-surface-muted text-text-secondary border border-border hover:bg-border-light transition-colors"
              >
                Employee Demo
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="flex items-center justify-center gap-2 mt-6 text-center text-[11px] text-text-muted">
          <ShieldCheck className="w-3.5 h-3.5 text-primary-600" />
          <span>Role-based access with Row Level Security & audit logging</span>
        </div>
      </motion.div>
    </div>
  );
}
