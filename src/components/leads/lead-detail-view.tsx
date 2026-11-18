'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Building2,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  MessageCircle,
  ArrowLeft,
  ShieldCheck,
  Tag,
  Edit,
  Send,
  Check,
} from 'lucide-react';
import { Lead, LeadActivity, LeadRemark, LeadStatus, CallOutcome } from '@/types';
import { LeadStatusBadge } from './lead-status-badge';
import { LeadPriorityBadge } from './lead-priority-badge';
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

  // Submit Remark
  const handleAddRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemarkText.trim()) return;

    setSubmittingRemark(true);
    try {
      const newRemark: LeadRemark = {
        id: `rem-${Date.now()}`,
        lead_id: lead.id,
        employee_id: 'emp-current',
        remark: newRemarkText.trim(),
        created_at: new Date().toISOString(),
        employee: {
          id: 'emp-current',
          full_name: isAdmin ? 'Administrator' : 'Sales Executive',
          employee_id: isAdmin ? 'ADM001' : 'EMP1001',
        },
      };

      setRemarks((prev) => [newRemark, ...prev]);

      // Also log activity
      const newActivity: LeadActivity = {
        id: `act-${Date.now()}`,
        lead_id: lead.id,
        employee_id: 'emp-current',
        activity_type: 'remark_added',
        call_outcome: null,
        duration_seconds: 0,
        description: `Remark added: "${newRemarkText.trim()}"`,
        metadata: {},
        created_at: new Date().toISOString(),
        employee: newRemark.employee,
      };

      setActivities((prev) => [newActivity, ...prev]);
      setNewRemarkText('');
    } catch (err) {
      console.error('Error adding remark:', err);
    } finally {
      setSubmittingRemark(false);
    }
  };

  // Submit Status Change / Call Outcome
  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingStatus(true);

    try {
      setCurrentStatus(selectedStatus);

      // Create activity record
      const isCall = !!selectedCallOutcome;
      const newActivity: LeadActivity = {
        id: `act-${Date.now()}`,
        lead_id: lead.id,
        employee_id: 'emp-current',
        activity_type: isCall ? 'call_outcome' : 'status_changed',
        call_outcome: selectedCallOutcome || null,
        duration_seconds: isCall ? 180 : 0,
        description: statusNotes.trim() || `Status updated to ${statusLabels[selectedStatus] || selectedStatus}`,
        metadata: {
          confirmed: selectedStatus === 'confirmed',
          timestamp: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
        employee: {
          id: 'emp-current',
          full_name: isAdmin ? 'Administrator' : 'Sales Executive',
          employee_id: isAdmin ? 'ADM001' : 'EMP1001',
        },
      };

      setActivities((prev) => [newActivity, ...prev]);

      // If remarks were entered with confirmation, append to remarks
      if (statusNotes.trim()) {
        const newRemark: LeadRemark = {
          id: `rem-${Date.now()}`,
          lead_id: lead.id,
          employee_id: 'emp-current',
          remark: `[Status: ${statusLabels[selectedStatus]}] ${statusNotes.trim()}`,
          created_at: new Date().toISOString(),
          employee: newActivity.employee,
        };
        setRemarks((prev) => [newRemark, ...prev]);
      }

      setIsStatusDialogOpen(false);
      setStatusNotes('');
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setSubmittingStatus(false);
    }
  };

  // Submit Follow-up Schedule
  const handleFollowupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followupDate) return;

    setSubmittingFollowup(true);
    try {
      const scheduledDateTime = new Date(`${followupDate}T${followupTime}:00`);

      const newActivity: LeadActivity = {
        id: `act-${Date.now()}`,
        lead_id: lead.id,
        employee_id: 'emp-current',
        activity_type: 'followup_scheduled',
        call_outcome: null,
        duration_seconds: 0,
        description: `Follow-up scheduled for ${formatDateTime(scheduledDateTime)}: "${followupPurpose || 'General discussion'}"`,
        metadata: { scheduled_at: scheduledDateTime.toISOString() },
        created_at: new Date().toISOString(),
      };

      setActivities((prev) => [newActivity, ...prev]);
      setIsFollowupDialogOpen(false);
      setFollowupPurpose('');
    } catch (err) {
      console.error('Error scheduling follow-up:', err);
    } finally {
      setSubmittingFollowup(false);
    }
  };

  const telUrl = getTelUrl(lead.phone);
  const waUrl = getWhatsAppUrl(lead.normalized_phone || lead.phone);

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href={isAdmin ? '/admin/leads' : '/employee/my-leads'}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {isAdmin ? 'All Leads' : 'My Leads'}</span>
        </Link>
      </div>

      {/* Top Header Card */}
      <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-200 tabular-nums">
              Lead #{lead.lead_number}
            </span>
            <LeadStatusBadge status={currentStatus} />
            <LeadPriorityBadge priority={lead.priority} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            {lead.business_name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted mt-1.5">
            {lead.contact_person && (
              <span className="flex items-center gap-1 text-text-secondary">
                <User className="w-3.5 h-3.5 text-text-muted" />
                {lead.contact_person}
              </span>
            )}
            {lead.city && (
              <span className="flex items-center gap-1 text-text-secondary">
                <MapPin className="w-3.5 h-3.5 text-text-muted" />
                {lead.city}, {lead.state}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-text-muted" />
              Created {formatDate(lead.created_at)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {telUrl && (
            <a
              href={telUrl}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-xs transition-colors"
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
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          )}

          <Button
            variant="outline"
            onClick={() => setIsStatusDialogOpen(true)}
            className="text-xs h-9 border-border bg-surface hover:bg-surface-muted"
          >
            <Edit className="w-3.5 h-3.5 mr-1.5 text-text-muted" />
            <span>Update Status</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setIsFollowupDialogOpen(true)}
            className="text-xs h-9 border-border bg-surface hover:bg-surface-muted"
          >
            <Clock className="w-3.5 h-3.5 mr-1.5 text-text-muted" />
            <span>Schedule Follow-up</span>
          </Button>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Business Profile & Custom Fields */}
        <div className="space-y-6">
          {/* Business Contact Card */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-text-primary border-b border-border-light pb-2.5">
              Business Information
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] text-text-muted block">Phone Number</span>
                <span className="font-semibold text-text-primary mt-0.5 block tabular-nums">
                  {lead.phone || '—'}
                </span>
              </div>

              {lead.alternate_phone && (
                <div>
                  <span className="text-[11px] text-text-muted block">Alternate Phone</span>
                  <span className="font-semibold text-text-primary mt-0.5 block tabular-nums">
                    {lead.alternate_phone}
                  </span>
                </div>
              )}

              <div>
                <span className="text-[11px] text-text-muted block">Email Address</span>
                {lead.email ? (
                  <a
                    href={`mailto:${lead.email}`}
                    className="font-medium text-primary-600 hover:underline mt-0.5 block"
                  >
                    {lead.email}
                  </a>
                ) : (
                  <span className="text-text-muted">—</span>
                )}
              </div>

              <div>
                <span className="text-[11px] text-text-muted block">Website</span>
                {lead.website ? (
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary-600 hover:underline mt-0.5 block flex items-center gap-1"
                  >
                    <span>{lead.website}</span>
                    <Globe className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-text-muted">—</span>
                )}
              </div>

              <div>
                <span className="text-[11px] text-text-muted block">Business Category</span>
                <span className="font-medium text-text-primary mt-0.5 block">
                  {lead.category || '—'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-text-muted block">Full Address</span>
                <span className="text-text-secondary mt-0.5 block leading-relaxed">
                  {lead.address || '—'}
                  {lead.city && `, ${lead.city}`}
                  {lead.state && `, ${lead.state}`}
                  {lead.country && ` (${lead.country})`}
                </span>
              </div>

              {lead.business_details && (
                <div>
                  <span className="text-[11px] text-text-muted block">Business Notes & Context</span>
                  <p className="text-text-secondary mt-0.5 leading-relaxed bg-surface-muted/60 p-2.5 rounded-lg border border-border-light">
                    {lead.business_details}
                  </p>
                </div>
              )}
            </div>

            {/* Custom Fields (GST, Turnover, etc.) */}
            {lead.custom_fields && Object.keys(lead.custom_fields).length > 0 && (
              <div className="pt-3 border-t border-border-light">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-2">
                  Custom Properties
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(lead.custom_fields).map(([key, val]) => (
                    <div key={key} className="p-2 rounded-lg bg-surface-muted border border-border-light">
                      <span className="text-[10px] text-text-muted uppercase block">{key.replace(/_/g, ' ')}</span>
                      <span className="font-semibold text-text-primary truncate block mt-0.5">
                        {String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Remarks & Activity Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add Remark Form */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs" id="remark">
            <h3 className="text-sm font-semibold text-text-primary mb-3">
              Add Call Remark / Note
            </h3>
            <form onSubmit={handleAddRemark} className="space-y-3">
              <Textarea
                placeholder="Log notes from your conversation, customer requirements, agreed next steps..."
                value={newRemarkText}
                onChange={(e) => setNewRemarkText(e.target.value)}
                className="text-xs bg-surface-muted/40 border-border focus:border-primary-500 rounded-xl min-h-[90px]"
                required
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={submittingRemark || !newRemarkText.trim()}
                  className="text-xs bg-primary-600 hover:bg-primary-700 text-white h-8 px-4"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  <span>Save Remark</span>
                </Button>
              </div>
            </form>
          </div>

          {/* Historical Remarks List (Chronological, Never overwritten) */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs">
            <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center justify-between">
              <span>Conversation Remarks ({remarks.length})</span>
              <span className="text-[11px] text-text-muted font-normal">Preserved chronologically</span>
            </h3>

            <div className="space-y-3">
              {remarks.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-6">No remarks recorded yet</p>
              ) : (
                remarks.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-xl bg-surface-muted/60 border border-border-light text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-text-primary flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-primary-600" />
                        {r.employee?.full_name || 'Staff'}
                      </span>
                      <span className="text-[10px] text-text-muted tabular-nums">
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
          </div>

          {/* Activity Timeline */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs">
            <h3 className="text-sm font-semibold text-text-primary mb-4">
              Complete Activity Timeline
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-light">
              {activities.map((act) => (
                <div key={act.id} className="relative group">
                  {/* Dot */}
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-primary-500 border-2 border-surface" />

                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-text-primary">
                        {act.call_outcome
                          ? `Call: ${callOutcomeLabels[act.call_outcome] || act.call_outcome}`
                          : act.activity_type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="text-[10px] text-text-muted tabular-nums">
                        {formatRelativeTime(act.created_at)}
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed">
                      {act.description}
                    </p>

                    {act.employee && (
                      <span className="text-[10px] text-text-muted">
                        Recorded by {act.employee.full_name} ({act.employee.employee_id})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Dialog (with Confirmation Workflow) */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-text-primary">
              Update Lead Status
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted">
              Select the new pipeline stage and record call outcome notes.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleStatusSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Pipeline Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(val) => setSelectedStatus((val as LeadStatus) || 'new')}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="follow_up">Follow-up Scheduled</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed (Won Deal)</SelectItem>
                  <SelectItem value="not_interested">Not Interested</SelectItem>
                  <SelectItem value="unqualified">Invalid / Unqualified</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Call Outcome */}
            <div className="space-y-1.5">
              <Label className="text-xs">Call Outcome (Optional)</Label>
              <Select
                value={selectedCallOutcome}
                onValueChange={(val) => setSelectedCallOutcome((val as CallOutcome) || '')}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select call result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="connected">Connected / Spoke with client</SelectItem>
                  <SelectItem value="busy">Busy line</SelectItem>
                  <SelectItem value="no_answer">No answer / Ringing</SelectItem>
                  <SelectItem value="call_back">Call back requested</SelectItem>
                  <SelectItem value="wrong_number">Wrong number</SelectItem>
                  <SelectItem value="switched_off">Switched off</SelectItem>
                  <SelectItem value="not_reachable">Not reachable</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Special Confirmation Notice if "Confirmed" */}
            {selectedStatus === 'confirmed' && (
              <div className="p-3 rounded-xl bg-success-bg border border-success/30 text-success text-xs space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Deal Confirmation Workflow
                </span>
                <p className="text-[11px] text-success/90">
                  Marking this lead as Confirmed will record your employee identity, capture the exact timestamp, and update company KPI dashboards. Please enter deal notes below.
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">
                {selectedStatus === 'confirmed' ? 'Confirmation Details & Notes' : 'Interaction Notes'}
              </Label>
              <Textarea
                placeholder="Enter details..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                className="text-xs min-h-[80px]"
                required={selectedStatus === 'confirmed'}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsStatusDialogOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingStatus}
                size="sm"
                className="text-xs bg-primary-600 hover:bg-primary-700 text-white"
              >
                {submittingStatus ? 'Updating...' : 'Save & Record Activity'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Schedule Follow-up Dialog */}
      <Dialog open={isFollowupDialogOpen} onOpenChange={setIsFollowupDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-text-primary">
              Schedule Follow-up
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted">
              Set date and time reminder for next call or meeting.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFollowupSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Follow-up Date</Label>
                <Input
                  type="date"
                  value={followupDate}
                  onChange={(e) => setFollowupDate(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Time (IST)</Label>
                <Input
                  type="time"
                  value={followupTime}
                  onChange={(e) => setFollowupTime(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Meeting Purpose / Agenda</Label>
              <Input
                placeholder="e.g. Contract review, demo, price discount"
                value={followupPurpose}
                onChange={(e) => setFollowupPurpose(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsFollowupDialogOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingFollowup}
                size="sm"
                className="text-xs bg-primary-600 hover:bg-primary-700 text-white"
              >
                {submittingFollowup ? 'Saving...' : 'Set Reminder'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
