// Core TypeScript types for Digital Sales CRM

// ============================================================
// ENUMS
// ============================================================

export type UserRole = 'admin' | 'employee';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'interested'
  | 'follow_up'
  | 'pending'
  | 'confirmed'
  | 'not_interested'
  | 'unqualified'
  | 'archived';

export type CallOutcome =
  | 'no_answer'
  | 'busy'
  | 'call_back'
  | 'connected'
  | 'wrong_number'
  | 'switched_off'
  | 'not_reachable'
  | 'other';

export type LeadPriority = 'critical' | 'high' | 'medium' | 'low' | 'none';

export type AssignmentType = 'admin_assigned' | 'self_selected' | 'bulk_assigned' | 'auto_assigned';

export type FollowUpStatus = 'scheduled' | 'due_today' | 'overdue' | 'completed' | 'cancelled';

export type ImportStatus = 'pending' | 'uploading' | 'mapping' | 'validating' | 'processing' | 'completed' | 'failed' | 'cancelled';

export type ImportRowStatus = 'pending' | 'valid' | 'duplicate' | 'invalid' | 'imported' | 'failed';

export type ActivityType =
  | 'lead_created'
  | 'lead_imported'
  | 'lead_assigned'
  | 'lead_reassigned'
  | 'lead_unassigned'
  | 'call_attempted'
  | 'call_outcome'
  | 'status_changed'
  | 'remark_added'
  | 'followup_scheduled'
  | 'followup_completed'
  | 'followup_cancelled'
  | 'lead_confirmed'
  | 'lead_archived'
  | 'lead_claimed'
  | 'priority_changed'
  | 'lead_updated';

export type NotificationType =
  | 'lead_assigned'
  | 'lead_reassigned'
  | 'followup_due'
  | 'followup_overdue'
  | 'admin_announcement'
  | 'account_change'
  | 'import_completed'
  | 'import_failed'
  | 'lead_update';

// ============================================================
// DATABASE MODELS
// ============================================================

export interface Profile {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  department: string | null;
  job_title: string | null;
  avatar_url: string | null;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  lead_number: number;
  business_name: string;
  contact_person: string | null;
  phone: string | null;
  normalized_phone: string | null;
  alternate_phone: string | null;
  email: string | null;
  website: string | null;
  category: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  business_details: string | null;
  custom_fields: Record<string, unknown> | null;
  source: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  created_by: string | null;
  import_job_id: string | null;
  last_contacted_at: string | null;
  confirmed_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadWithAssignment extends Lead {
  assigned_employee?: Pick<Profile, 'id' | 'full_name' | 'employee_id'> | null;
  assignment?: LeadAssignment | null;
}

export interface LeadAssignment {
  id: string;
  lead_id: string;
  employee_id: string;
  assigned_by: string | null;
  assignment_type: AssignmentType;
  assigned_at: string;
  released_at: string | null;
  is_active: boolean;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  employee_id: string | null;
  activity_type: ActivityType;
  call_outcome: CallOutcome | null;
  duration_seconds: number | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  // Joined fields
  employee?: Pick<Profile, 'id' | 'full_name' | 'employee_id'> | null;
}

export interface LeadRemark {
  id: string;
  lead_id: string;
  employee_id: string;
  remark: string;
  created_at: string;
  // Joined fields
  employee?: Pick<Profile, 'id' | 'full_name' | 'employee_id'> | null;
}

export interface FollowUp {
  id: string;
  lead_id: string;
  employee_id: string;
  scheduled_at: string;
  purpose: string | null;
  notes: string | null;
  status: FollowUpStatus;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  // Joined fields
  lead?: Pick<Lead, 'id' | 'lead_number' | 'business_name' | 'contact_person' | 'phone' | 'status'> | null;
  employee?: Pick<Profile, 'id' | 'full_name' | 'employee_id'> | null;
}

export interface ImportJob {
  id: string;
  filename: string;
  uploaded_by: string;
  total_rows: number;
  processed_rows: number;
  successful_rows: number;
  duplicate_rows: number;
  failed_rows: number;
  status: ImportStatus;
  storage_path: string | null;
  column_mapping: Record<string, string> | null;
  settings: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
  // Joined fields
  uploader?: Pick<Profile, 'id' | 'full_name'> | null;
}

export interface ImportRow {
  id: string;
  import_job_id: string;
  row_number: number;
  raw_data: Record<string, unknown>;
  normalized_data: Record<string, unknown> | null;
  validation_errors: Array<{ field: string; message: string }> | null;
  processing_status: ImportRowStatus;
  lead_id: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  related_entity_id: string | null;
  related_entity_type: string | null;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  // Joined fields
  actor?: Pick<Profile, 'id' | 'full_name' | 'employee_id' | 'role'> | null;
}

export interface LeadTag {
  id: string;
  name: string;
  color: string | null;
  created_at: string;
}

export interface SavedFilter {
  id: string;
  user_id: string;
  name: string;
  filters: Record<string, unknown>;
  entity_type: string;
  is_default: boolean;
  created_at: string;
}

// ============================================================
// API / UI TYPES
// ============================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface LeadFilterParams extends PaginationParams {
  search?: string;
  status?: LeadStatus | LeadStatus[];
  priority?: LeadPriority | LeadPriority[];
  assignedTo?: string;
  unassigned?: boolean;
  category?: string;
  city?: string;
  state?: string;
  country?: string;
  source?: string;
  createdFrom?: string;
  createdTo?: string;
  lastContactedFrom?: string;
  lastContactedTo?: string;
  followUpFrom?: string;
  followUpTo?: string;
  importJobId?: string;
}

export interface DashboardKPI {
  label: string;
  value: number;
  icon: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    period: string;
  };
  href?: string;
  color?: string;
}

export interface EmployeePerformance {
  employee: Pick<Profile, 'id' | 'full_name' | 'employee_id'>;
  assignedLeads: number;
  contactedLeads: number;
  interestedLeads: number;
  confirmedLeads: number;
  pendingLeads: number;
  followUpsCompleted: number;
  overdueFollowUps: number;
  conversionRate: number;
  contactRate: number;
}

export interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  isRequired: boolean;
  transform?: string;
}

export interface ImportPreview {
  totalRows: number;
  sampleRows: Record<string, unknown>[];
  detectedColumns: string[];
  suggestedMappings: ColumnMapping[];
  validationSummary: {
    valid: number;
    invalid: number;
    duplicate: number;
    warnings: number;
  };
}

// ============================================================
// NAV TYPES
// ============================================================

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  children?: NavItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}
