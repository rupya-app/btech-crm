'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Phone,
  Globe,
  MapPin,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  MessageCircle,
  ArrowLeft,
  Edit,
  Send,
} from 'lucide-react';
import { Lead, LeadActivity, LeadRemark, LeadStatus, CallOutcome } from '@/types';
import { LeadStatusBadge } from './lead-status-badge';
import { LeadPriorityBadge } from './lead-priority-badge';
import { AdminPageContainer, PageCard, SuccessNotice } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  formatDate,
  formatDateTime,
  formatRelativeTime,
  getWhatsAppUrl,
  getTelUrl,
  callOutcomeLabels,
  statusLabels,
} from '@/lib/utils';

interface LeadDetailViewProps {
  lead: Lead;
  activities: LeadActivity[];
  remarks: LeadRemark[];
  isAdmin?: boolean;
}

export function LeadDetailView({
  lead,
  activities: initialActivities,
  remarks: initialRemarks,
  isAdmin = true,
}: LeadDetailViewProps) {
  const router = useRouter();

  const [activities, setActivities] = useState(initialActivities);
  const [remarks, setRemarks] = useState(initialRemarks);
  const [currentStatus, setCurrentStatus] = useState<LeadStatus>(lead.status);
  const [notice, setNotice] = useState<string | null>(null);

  // Add Remark State
  const [newRemarkText, setNewRemarkText] = useState('');
  const [submittingRemark, setSubmittingRemark] = useState(false);

  // Status Modal State
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>(lead.status);
  const [selectedCallOutcome, setSelectedCallOutcome] = useState<CallOutcome | ''>('');
  const [statusNotes, setStatusNotes] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // Schedule Followup State
  const [isFollowupDialogOpen, setIsFollowupDialogOpen] = useState(false);
  const [followupDate, setFollowupDate] = useState('');
  const [followupTime, setFollowupTime] = useState('11:00');
  const [followupPurpose, setFollowupPurpose] = useState('');
  const [submittingFollowup, setSubmittingFollowup] = useState(false);

  // Submit Remark to Supabase
  const handleAddRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemarkText.trim()) return;

    setSubmittingRemark(true);
    try {
      const res = await fetch('/api/leads/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          action: 'add_remark',
          remark: newRemarkText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.remark) {
        setRemarks((prev) => [data.remark, ...prev]);
      }
      if (data.activity) {
        setActivities((prev) => [data.activity, ...prev]);
      }

      setNewRemarkText('');
      setNotice('Remark saved to database.');
      router.refresh();
    } catch (err) {
      console.error('Error adding remark:', err);
    } finally {
      setSubmittingRemark(false);
    }
  };

  // Submit Status Change / Call Outcome to Supabase
  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingStatus(true);

    try {
      const res = await fetch('/api/leads/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          action: 'update_status',
          status: selectedStatus,
          callOutcome: selectedCallOutcome || null,
          remark: statusNotes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCurrentStatus(selectedStatus);
      if (data.activity) {
        setActivities((prev) => [data.activity, ...prev]);
      }
      if (data.remark) {
        setRemarks((prev) => [data.remark, ...prev]);
      }

      setIsStatusDialogOpen(false);
      setStatusNotes('');
      setNotice(`Pipeline stage updated to "${statusLabels[selectedStatus] || selectedStatus}".`);
      router.refresh();
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setSubmittingStatus(false);
    }
  };

  // Submit Follow-up Schedule to Supabase
  const handleFollowupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followupDate) return;

    setSubmittingFollowup(true);
    try {
      const scheduledDateTime = new Date(`${followupDate}T${followupTime}:00`);

      const res = await fetch('/api/leads/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          action: 'schedule_followup',
          scheduledAt: scheduledDateTime.toISOString(),
          purpose: followupPurpose || 'Scheduled follow-up call',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.activity) {
        setActivities((prev) => [data.activity, ...prev]);
      }
      if (currentStatus !== 'confirmed') {
        setCurrentStatus('follow_up');
      }

      setIsFollowupDialogOpen(false);
      setFollowupPurpose('');
      setNotice(`Follow-up reminder scheduled for ${formatDateTime(scheduledDateTime)}.`);
      router.refresh();
    } catch (err) {
      console.error('Error scheduling follow-up:', err);
    } finally {
      setSubmittingFollowup(false);
    }
  };

  const telUrl = getTelUrl(lead.phone);
  const waUrl = getWhatsAppUrl(lead.normalized_phone || lead.phone);

  return (
    <AdminPageContainer>
      {/* Back Link */}
      <div>
        <Link
          href={isAdmin ? '/admin/leads' : '/employee/my-leads'}
          className="inline-flex items-center rounded-xl bg-white border border-border text-[13px] font-semibold text-text-secondary hover:text-primary-700 hover:border-primary-200 transition-all shadow-xs"
          style={{ padding: '8px 16px', gap: '8px' }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {isAdmin ? 'Pipeline Leads' : 'My Leads'}</span>
        </Link>
      </div>

      {notice && <SuccessNotice message={notice} />}

      {/* Top Header Card */}
      <PageCard className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center flex-wrap" style={{ gap: '10px', marginBottom: '12px' }}>
            <span
              className="text-xs font-bold text-primary-700 bg-primary-50 rounded-full border border-primary-200 tabular-nums"
              style={{ padding: '4px 12px' }}
            >
              Lead #{lead.lead_number}
            </span>
            <LeadStatusBadge status={currentStatus} />
            <LeadPriorityBadge priority={lead.priority} />
          </div>

          <h1 className="text-[26px] sm:text-[28px] font-bold tracking-tight text-text-primary">
            {lead.business_name}
          </h1>

          <div
            className="flex flex-wrap items-center text-[13px] text-text-muted"
            style={{ gap: '20px', marginTop: '10px' }}
          >
            {lead.contact_person && (
              <span className="flex items-center text-text-secondary font-medium" style={{ gap: '6px' }}>
                <User className="w-4 h-4 text-text-muted" />
                {lead.contact_person}
              </span>
            )}
            {lead.city && (
              <span className="flex items-center text-text-secondary font-medium" style={{ gap: '6px' }}>
                <MapPin className="w-4 h-4 text-text-muted" />
                {lead.city}
                {lead.state ? `, ${lead.state}` : ''}
              </span>
            )}
            <span className="flex items-center font-medium" style={{ gap: '6px' }}>
              <Calendar className="w-4 h-4 text-text-muted" />
              Created {formatDate(lead.created_at)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center" style={{ gap: '10px' }}>
          {telUrl && (
            <a
              href={telUrl}
              className="inline-flex items-center rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-semibold shadow-xs transition-colors"
              style={{ padding: '10px 16px', gap: '8px' }}
            >
              <Phone className="w-4 h-4" />
              <span>Call Business</span>
            </a>
          )}

          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold shadow-xs transition-colors"
              style={{ padding: '10px 16px', gap: '8px' }}
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          )}

          <Button
            variant="outline"
            onClick={() => setIsStatusDialogOpen(true)}
          >
            <Edit className="w-4 h-4 text-text-muted" />
            <span>Update Status</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setIsFollowupDialogOpen(true)}
          >
            <Clock className="w-4 h-4 text-text-muted" />
            <span>Schedule Follow-up</span>
          </Button>
        </div>
      </PageCard>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '24px' }}>
        {/* Left Column: Business Profile & Custom Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <PageCard style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3
              className="text-[16px] font-bold text-text-primary border-b border-border-light"
              style={{ paddingBottom: '14px' }}
            >
              Business Information
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="text-[13px]">
              <div>
                <span className="text-[11.5px] font-semibold text-text-muted block">Phone Number</span>
                <span className="font-bold text-text-primary mt-1 block tabular-nums text-[14px]">
                  {lead.phone || '—'}
                </span>
              </div>

              {lead.alternate_phone && (
                <div>
                  <span className="text-[11.5px] font-semibold text-text-muted block">Alternate Phone</span>
                  <span className="font-bold text-text-primary mt-1 block tabular-nums text-[14px]">
                    {lead.alternate_phone}
                  </span>
                </div>
              )}

              <div>
                <span className="text-[11.5px] font-semibold text-text-muted block">Email Address</span>
                {lead.email ? (
                  <a
                    href={`mailto:${lead.email}`}
                    className="font-medium text-primary-600 hover:underline mt-1 block text-[13.5px]"
                  >
                    {lead.email}
                  </a>
                ) : (
                  <span className="text-text-muted">—</span>
                )}
              </div>

              <div>
                <span className="text-[11.5px] font-semibold text-text-muted block">Website</span>
                {lead.website ? (
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary-600 hover:underline mt-1 flex items-center gap-1.5 text-[13.5px]"
                  >
                    <span>{lead.website}</span>
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-text-muted">—</span>
                )}
              </div>

              <div>
                <span className="text-[11.5px] font-semibold text-text-muted block">Business Category</span>
                <span className="font-semibold text-text-primary mt-1 block text-[13.5px]">
                  {lead.category || '—'}
                </span>
              </div>

              <div>
                <span className="text-[11.5px] font-semibold text-text-muted block">Full Address</span>
                <span className="text-text-secondary mt-1 block leading-relaxed font-medium">
                  {lead.address || '—'}
                  {lead.city && `, ${lead.city}`}
                  {lead.state && `, ${lead.state}`}
                  {lead.country && ` (${lead.country})`}
                </span>
              </div>

              {lead.business_details && (
                <div>
                  <span className="text-[11.5px] font-semibold text-text-muted block">
                    Business Notes & Context
                  </span>
                  <p
                    className="text-text-secondary mt-1.5 leading-relaxed bg-[#F8FAFB] rounded-xl border border-border-light text-[13px]"
                    style={{ padding: '14px' }}
                  >
                    {lead.business_details}
                  </p>
                </div>
              )}
            </div>

            {lead.custom_fields && Object.keys(lead.custom_fields).length > 0 && (
              <div className="border-t border-border-light" style={{ paddingTop: '16px' }}>
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-3">
                  Custom Properties
                </span>
                <div className="grid grid-cols-2" style={{ gap: '10px' }}>
                  {Object.entries(lead.custom_fields).map(([key, val]) => (
                    <div
                      key={key}
                      className="rounded-xl bg-[#F8FAFB] border border-border-light"
                      style={{ padding: '12px' }}
                    >
                      <span className="text-[10px] text-text-muted uppercase font-semibold block">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="font-bold text-text-primary truncate block mt-1 text-[13px]">
                        {String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </PageCard>
        </div>

        {/* Right Column: Remarks & Activity Timeline */}
        <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Add Remark Form */}
          <PageCard id="remark">
            <h3 className="text-[16px] font-bold text-text-primary" style={{ marginBottom: '14px' }}>
              Add Call Remark / Note
            </h3>
            <form onSubmit={handleAddRemark} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Textarea
                placeholder="Log notes from your conversation, customer requirements, agreed next steps..."
                value={newRemarkText}
                onChange={(e) => setNewRemarkText(e.target.value)}
                required
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={submittingRemark || !newRemarkText.trim()}
                >
                  <Send className="w-4 h-4" />
                  <span>{submittingRemark ? 'Saving...' : 'Save Remark'}</span>
                </Button>
              </div>
            </form>
          </PageCard>

          {/* Historical Remarks List */}
          <PageCard>
            <h3
              className="text-[16px] font-bold text-text-primary flex items-center justify-between"
              style={{ marginBottom: '18px' }}
            >
              <span>Conversation Remarks ({remarks.length})</span>
              <span className="text-xs text-text-muted font-normal">Preserved chronologically</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {remarks.length === 0 ? (
                <p className="text-[13px] text-text-muted text-center py-8">
                  No remarks recorded yet for this lead.
                </p>
              ) : (
                remarks.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl bg-[#F8FAFB] border border-border-light text-[13px]"
                    style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text-primary flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-primary-600" />
                        {r.employee?.full_name || 'Sales Team'}
                      </span>
                      <span className="text-[11.5px] text-text-muted tabular-nums">
                        {formatDateTime(r.created_at)}
                      </span>
                    </div>
                    <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                      {r.remark}
                    </p>
                  </div>
                ))
              )}
            </div>
          </PageCard>

          {/* Activity Timeline */}
          <PageCard>
            <h3 className="text-[16px] font-bold text-text-primary" style={{ marginBottom: '20px' }}>
              Complete Activity Timeline ({activities.length})
            </h3>

            {activities.length === 0 ? (
              <p className="text-[13px] text-text-muted text-center py-6">
                No activity events logged yet.
              </p>
            ) : (
              <div
                className="relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-light"
                style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                {activities.map((act) => (
                  <div key={act.id} className="relative group">
                    <span className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-primary-500 border-2 border-white" />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="font-bold text-text-primary">
                          {act.call_outcome
                            ? `Call: ${callOutcomeLabels[act.call_outcome] || act.call_outcome}`
                            : act.activity_type.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <span className="text-[11.5px] text-text-muted tabular-nums">
                          {formatRelativeTime(act.created_at)}
                        </span>
                      </div>

                      <p className="text-[13px] text-text-secondary leading-relaxed">
                        {act.description}
                      </p>

                      {act.employee && (
                        <span className="text-[11.5px] text-text-muted">
                          Recorded by {act.employee.full_name} ({act.employee.employee_id})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PageCard>
        </div>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Update Lead Status</DialogTitle>
            <DialogDescription>
              Select the new pipeline stage and record call outcome notes in the database.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleStatusSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Label className="text-[13px] font-semibold text-text-primary">Pipeline Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(val) => setSelectedStatus((val as LeadStatus) || 'new')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New Inquiry</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="interested">Interested Prospect</SelectItem>
                  <SelectItem value="follow_up">Follow-up Queue</SelectItem>
                  <SelectItem value="pending">Pending Decision</SelectItem>
                  <SelectItem value="confirmed">Confirmed Won (Deal Closed)</SelectItem>
                  <SelectItem value="not_interested">Closed Lost (Not Interested)</SelectItem>
                  <SelectItem value="unqualified">Disqualified / Invalid</SelectItem>
                  <SelectItem value="archived">Archived Vault</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Label className="text-[13px] font-semibold text-text-primary">
                Call Outcome (Optional)
              </Label>
              <Select
                value={selectedCallOutcome}
                onValueChange={(val) => setSelectedCallOutcome((val as CallOutcome) || '')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select call result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="connected">Connected / Spoke with client</SelectItem>
                  <SelectItem value="call_back">Call back requested</SelectItem>
                  <SelectItem value="busy">Busy line</SelectItem>
                  <SelectItem value="no_answer">No answer / Ringing</SelectItem>
                  <SelectItem value="wrong_number">Wrong number</SelectItem>
                  <SelectItem value="switched_off">Switched off</SelectItem>
                  <SelectItem value="not_reachable">Not reachable</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedStatus === 'confirmed' && (
              <div
                className="rounded-xl bg-success-bg border border-success/30 text-success text-xs"
                style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}
              >
                <span className="font-bold flex items-center gap-2 text-[13px]">
                  <CheckCircle2 className="w-4 h-4" />
                  Deal Confirmation Workflow
                </span>
                <p className="text-xs text-success/90 leading-relaxed">
                  Marking this lead as Confirmed Won records your employee identity, captures the exact timestamp, and updates live KPI dashboards.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Label className="text-[13px] font-semibold text-text-primary">
                {selectedStatus === 'confirmed' ? 'Confirmation Details & Notes *' : 'Interaction Notes'}
              </Label>
              <Textarea
                placeholder="Enter call details or deal notes..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                required={selectedStatus === 'confirmed'}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsStatusDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submittingStatus}>
                {submittingStatus ? 'Updating...' : 'Save & Record Activity'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Schedule Follow-up Dialog */}
      <Dialog open={isFollowupDialogOpen} onOpenChange={setIsFollowupDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Follow-up</DialogTitle>
            <DialogDescription>
              Set a date and time reminder for your next call or client meeting.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFollowupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="grid grid-cols-2" style={{ gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Label className="text-[13px] font-semibold text-text-primary">Follow-up Date</Label>
                <Input
                  type="date"
                  value={followupDate}
                  onChange={(e) => setFollowupDate(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Label className="text-[13px] font-semibold text-text-primary">Time (IST)</Label>
                <Input
                  type="time"
                  value={followupTime}
                  onChange={(e) => setFollowupTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Label className="text-[13px] font-semibold text-text-primary">
                Meeting Purpose / Agenda
              </Label>
              <Input
                placeholder="e.g. Contract review, demo, pricing discussion"
                value={followupPurpose}
                onChange={(e) => setFollowupPurpose(e.target.value)}
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFollowupDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submittingFollowup}>
                {submittingFollowup ? 'Saving...' : 'Set Reminder'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminPageContainer>
  );
}
