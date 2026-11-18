-- ============================================================
-- DIGITAL SALES CRM — COMPLETE DATABASE SCHEMA
-- Migration: 01_initial_schema.sql
-- Compatible with Supabase PostgreSQL & Row Level Security (RLS)
-- ============================================================

-- 0. EXTENSIONS & PREREQUISITES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
    department TEXT,
    job_title TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    must_change_password BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index on employee_id for fast login lookups
CREATE INDEX IF NOT EXISTS idx_profiles_employee_id ON public.profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

-- 2. IMPORT JOBS TABLE (defined early for foreign key references)
CREATE TABLE IF NOT EXISTS public.import_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    total_rows INTEGER NOT NULL DEFAULT 0,
    processed_rows INTEGER NOT NULL DEFAULT 0,
    successful_rows INTEGER NOT NULL DEFAULT 0,
    duplicate_rows INTEGER NOT NULL DEFAULT 0,
    failed_rows INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'uploading', 'mapping', 'validating', 'processing', 'completed', 'failed', 'cancelled')),
    storage_path TEXT,
    column_mapping JSONB,
    settings JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_import_jobs_status ON public.import_jobs(status);
CREATE INDEX IF NOT EXISTS idx_import_jobs_created_at ON public.import_jobs(created_at DESC);

-- 3. LEADS TABLE
CREATE SEQUENCE IF NOT EXISTS lead_number_seq START WITH 10001;

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_number BIGINT NOT NULL UNIQUE DEFAULT nextval('lead_number_seq'),
    business_name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    normalized_phone TEXT,
    alternate_phone TEXT,
    email TEXT,
    website TEXT,
    category TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    business_details TEXT,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    source TEXT DEFAULT 'Excel Import',
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'follow_up', 'pending', 'confirmed', 'not_interested', 'unqualified', 'archived')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low', 'none')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    import_job_id UUID REFERENCES public.import_jobs(id) ON DELETE SET NULL,
    last_contacted_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- High-performance indexes for 50,000+ leads
CREATE INDEX IF NOT EXISTS idx_leads_lead_number ON public.leads(lead_number);
CREATE INDEX IF NOT EXISTS idx_leads_normalized_phone ON public.leads(normalized_phone) WHERE normalized_phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON public.leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_category ON public.leads(category);
CREATE INDEX IF NOT EXISTS idx_leads_city ON public.leads(city);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_last_contacted ON public.leads(last_contacted_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_search ON public.leads USING gin(to_tsvector('english', coalesce(business_name,'') || ' ' || coalesce(contact_person,'') || ' ' || coalesce(phone,'') || ' ' || coalesce(email,'')));

-- 4. LEAD ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.lead_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assignment_type TEXT NOT NULL DEFAULT 'admin_assigned' CHECK (assignment_type IN ('admin_assigned', 'self_selected', 'bulk_assigned', 'auto_assigned')),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    released_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- CRITICAL: Exactly one active assignment per lead enforced via partial unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_lead_assignment 
ON public.lead_assignments(lead_id) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_lead_assignments_employee ON public.lead_assignments(employee_id, is_active);
CREATE INDEX IF NOT EXISTS idx_lead_assignments_assigned_at ON public.lead_assignments(assigned_at DESC);

-- 5. LEAD ACTIVITIES TABLE (Audit trail of calls, status changes, etc.)
CREATE TABLE IF NOT EXISTS public.lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    activity_type TEXT NOT NULL,
    call_outcome TEXT CHECK (call_outcome IS NULL OR call_outcome IN ('no_answer', 'busy', 'call_back', 'connected', 'wrong_number', 'switched_off', 'not_reachable', 'other')),
    duration_seconds INTEGER DEFAULT 0,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead ON public.lead_activities(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_activities_employee ON public.lead_activities(employee_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_activities_type ON public.lead_activities(activity_type);

-- 6. LEAD REMARKS TABLE (Non-destructive conversation notes)
CREATE TABLE IF NOT EXISTS public.lead_remarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    remark TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_lead_remarks_lead ON public.lead_remarks(lead_id, created_at DESC);

-- 7. FOLLOW-UPS TABLE
CREATE TABLE IF NOT EXISTS public.follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    purpose TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'due_today', 'overdue', 'completed', 'cancelled')),
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_follow_ups_lead ON public.follow_ups(lead_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_employee ON public.follow_ups(employee_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_follow_ups_scheduled_at ON public.follow_ups(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_follow_ups_status ON public.follow_ups(status);

-- 8. IMPORT ROWS TABLE (For batch processing & error tracking)
CREATE TABLE IF NOT EXISTS public.import_rows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    import_job_id UUID NOT NULL REFERENCES public.import_jobs(id) ON DELETE CASCADE,
    row_number INTEGER NOT NULL,
    raw_data JSONB NOT NULL,
    normalized_data JSONB,
    validation_errors JSONB,
    processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'valid', 'duplicate', 'invalid', 'imported', 'failed')),
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_import_rows_job ON public.import_rows(import_job_id, processing_status);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    related_entity_id UUID,
    related_entity_type TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);

-- 10. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    before_data JSONB,
    after_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- 11. TEAMS TABLE
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. LEAD TAGS & ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.lead_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#24988A',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.lead_tag_assignments (
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.lead_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (lead_id, tag_id)
);

-- 13. SAVED FILTERS
CREATE TABLE IF NOT EXISTS public.saved_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    filters JSONB NOT NULL,
    entity_type TEXT NOT NULL DEFAULT 'leads',
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================
-- ATOMIC STORED PROCEDURES & SECURE DATABASE FUNCTIONS
-- ============================================================

-- Function 1: Atomic Lead Claiming with Concurrency Lock
-- Protects against two employees claiming the same lead concurrently
CREATE OR REPLACE FUNCTION public.claim_lead(
    p_lead_id UUID,
    p_employee_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_is_already_assigned BOOLEAN;
    v_lead_status TEXT;
    v_assignment_id UUID;
    v_business_name TEXT;
    v_employee_name TEXT;
BEGIN
    -- Acquire row-level lock on the lead to prevent concurrent race condition
    SELECT status, business_name INTO v_lead_status, v_business_name
    FROM public.leads
    WHERE id = p_lead_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Lead not found');
    END IF;

    -- Check if lead is already assigned actively
    SELECT EXISTS (
        SELECT 1 FROM public.lead_assignments
        WHERE lead_id = p_lead_id AND is_active = true
    ) INTO v_is_already_assigned;

    IF v_is_already_assigned THEN
        RETURN jsonb_build_object('success', false, 'error', 'This lead has just been claimed by another employee.');
    END IF;

    -- Fetch employee full name
    SELECT full_name INTO v_employee_name
    FROM public.profiles
    WHERE id = p_employee_id;

    -- Insert new active assignment
    INSERT INTO public.lead_assignments (
        lead_id,
        employee_id,
        assigned_by,
        assignment_type,
        assigned_at,
        is_active
    ) VALUES (
        p_lead_id,
        p_employee_id,
        p_employee_id,
        'self_selected',
        timezone('utc'::text, now()),
        true
    )
    RETURNING id INTO v_assignment_id;

    -- Log lead activity
    INSERT INTO public.lead_activities (
        lead_id,
        employee_id,
        activity_type,
        description
    ) VALUES (
        p_lead_id,
        p_employee_id,
        'lead_claimed',
        coalesce(v_employee_name, 'Employee') || ' self-claimed this lead from the available pool.'
    );

    -- Create notification for employee
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        notification_type,
        related_entity_id,
        related_entity_type
    ) VALUES (
        p_employee_id,
        'Lead Claimed Successfully',
        'You have successfully claimed "' || v_business_name || '".',
        'lead_assigned',
        p_lead_id,
        'lead'
    );

    RETURN jsonb_build_object(
        'success', true,
        'assignment_id', v_assignment_id,
        'lead_id', p_lead_id,
        'message', 'Lead claimed successfully'
    );
END;
$$;

-- Function 2: Bulk Assign Leads (Admin)
CREATE OR REPLACE FUNCTION public.assign_leads_bulk(
    p_lead_ids UUID[],
    p_employee_id UUID,
    p_assigned_by UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_lead_id UUID;
    v_assigned_count INTEGER := 0;
    v_employee_name TEXT;
BEGIN
    SELECT full_name INTO v_employee_name FROM public.profiles WHERE id = p_employee_id;

    FOREACH v_lead_id IN ARRAY p_lead_ids
    LOOP
        -- Deactivate any existing active assignment for this lead
        UPDATE public.lead_assignments
        SET is_active = false, released_at = timezone('utc'::text, now())
        WHERE lead_id = v_lead_id AND is_active = true;

        -- Create new active assignment
        INSERT INTO public.lead_assignments (
            lead_id,
            employee_id,
            assigned_by,
            assignment_type,
            assigned_at,
            is_active
        ) VALUES (
            v_lead_id,
            p_employee_id,
            p_assigned_by,
            'admin_assigned',
            timezone('utc'::text, now()),
            true
        );

        -- Activity log
        INSERT INTO public.lead_activities (
            lead_id,
            employee_id,
            activity_type,
            description
        ) VALUES (
            v_lead_id,
            p_assigned_by,
            'lead_assigned',
            'Lead assigned to ' || coalesce(v_employee_name, 'employee') || ' by administrator.'
        );

        v_assigned_count := v_assigned_count + 1;
    END LOOP;

    -- Send notification to target employee
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        notification_type
    ) VALUES (
        p_employee_id,
        'New Leads Assigned',
        v_assigned_count || ' new leads have been assigned to your workspace.',
        'lead_assigned'
    );

    RETURN jsonb_build_object('success', true, 'count', v_assigned_count);
END;
$$;

-- Function 3: Update Lead Status with Note and Outcome
CREATE OR REPLACE FUNCTION public.record_lead_interaction(
    p_lead_id UUID,
    p_employee_id UUID,
    p_new_status TEXT,
    p_call_outcome TEXT,
    p_remark TEXT,
    p_duration_seconds INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_status TEXT;
    v_confirmed_at TIMESTAMPTZ;
BEGIN
    SELECT status INTO v_old_status FROM public.leads WHERE id = p_lead_id FOR UPDATE;

    IF p_new_status = 'confirmed' AND v_old_status != 'confirmed' THEN
        v_confirmed_at := timezone('utc'::text, now());
    END IF;

    -- Update lead
    UPDATE public.leads
    SET 
        status = coalesce(p_new_status, status),
        last_contacted_at = timezone('utc'::text, now()),
        confirmed_at = coalesce(v_confirmed_at, confirmed_at),
        updated_at = timezone('utc'::text, now())
    WHERE id = p_lead_id;

    -- Add activity
    INSERT INTO public.lead_activities (
        lead_id,
        employee_id,
        activity_type,
        call_outcome,
        duration_seconds,
        description
    ) VALUES (
        p_lead_id,
        p_employee_id,
        CASE WHEN p_call_outcome IS NOT NULL THEN 'call_outcome' ELSE 'status_changed' END,
        p_call_outcome,
        p_duration_seconds,
        CASE 
            WHEN p_remark IS NOT NULL AND length(trim(p_remark)) > 0 THEN p_remark
            ELSE 'Status updated from ' || v_old_status || ' to ' || p_new_status
        END
    );

    -- Add remark if provided
    IF p_remark IS NOT NULL AND length(trim(p_remark)) > 0 THEN
        INSERT INTO public.lead_remarks (
            lead_id,
            employee_id,
            remark
        ) VALUES (
            p_lead_id,
            p_employee_id,
            p_remark
        );
    END IF;

    RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_remarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: is current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    );
$$;

-- PROFILES POLICIES
CREATE POLICY "Admins have full access to profiles"
ON public.profiles FOR ALL
TO authenticated
USING (public.is_admin());

CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update own avatar and phone"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- LEADS POLICIES
CREATE POLICY "Admins have full access to leads"
ON public.leads FOR ALL
TO authenticated
USING (public.is_admin());

CREATE POLICY "Employees can view assigned leads"
ON public.leads FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.lead_assignments
        WHERE lead_assignments.lead_id = leads.id 
          AND lead_assignments.employee_id = auth.uid() 
          AND lead_assignments.is_active = true
    )
);

CREATE POLICY "Employees can view unassigned leads in lead pool"
ON public.leads FOR SELECT
TO authenticated
USING (
    NOT EXISTS (
        SELECT 1 FROM public.lead_assignments
        WHERE lead_assignments.lead_id = leads.id 
          AND lead_assignments.is_active = true
    )
    AND leads.status NOT IN ('archived', 'unqualified')
);

CREATE POLICY "Employees can update assigned leads"
ON public.leads FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.lead_assignments
        WHERE lead_assignments.lead_id = leads.id 
          AND lead_assignments.employee_id = auth.uid() 
          AND lead_assignments.is_active = true
    )
);

-- LEAD ASSIGNMENTS POLICIES
CREATE POLICY "Admins have full access to lead assignments"
ON public.lead_assignments FOR ALL
TO authenticated
USING (public.is_admin());

CREATE POLICY "Employees can view their own assignments"
ON public.lead_assignments FOR SELECT
TO authenticated
USING (employee_id = auth.uid());

-- LEAD REMARKS POLICIES
CREATE POLICY "Admins have full access to remarks"
ON public.lead_remarks FOR ALL
TO authenticated
USING (public.is_admin());

CREATE POLICY "Employees can view remarks for their assigned leads"
ON public.lead_remarks FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.lead_assignments
        WHERE lead_assignments.lead_id = lead_remarks.lead_id 
          AND lead_assignments.employee_id = auth.uid() 
          AND lead_assignments.is_active = true
    )
);

CREATE POLICY "Employees can add remarks to their assigned leads"
ON public.lead_remarks FOR INSERT
TO authenticated
WITH CHECK (
    employee_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.lead_assignments
        WHERE lead_assignments.lead_id = lead_remarks.lead_id 
          AND lead_assignments.employee_id = auth.uid() 
          AND lead_assignments.is_active = true
    )
);

-- FOLLOW-UPS POLICIES
CREATE POLICY "Admins have full access to follow-ups"
ON public.follow_ups FOR ALL
TO authenticated
USING (public.is_admin());

CREATE POLICY "Employees can view their own follow-ups"
ON public.follow_ups FOR SELECT
TO authenticated
USING (employee_id = auth.uid());

CREATE POLICY "Employees can manage their own follow-ups"
ON public.follow_ups FOR ALL
TO authenticated
USING (employee_id = auth.uid())
WITH CHECK (employee_id = auth.uid());

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can view and update their own notifications"
ON public.notifications FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- AUDIT LOGS POLICIES
CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.is_admin());
