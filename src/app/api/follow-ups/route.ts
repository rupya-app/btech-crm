import { NextRequest, NextResponse } from 'next/server';
import { getDbClient, createServerSupabaseClient, invalidateCrmCache } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = await getDbClient();
    const url = new URL(request.url);
    const requestedEmpId = url.searchParams.get('employeeId');

    let currentUserId: string | null = null;
    let currentUserRole: string | null = null;

    try {
      const cookieStore = await cookies();
      const cached = cookieStore.get('crm_profile')?.value;
      if (cached) {
        const parsed = JSON.parse(decodeURIComponent(cached));
        currentUserId = parsed?.id || null;
        currentUserRole = parsed?.role || null;
      }
    } catch {}

    if (!currentUserId) {
      try {
        const authClient = await createServerSupabaseClient();
        const {
          data: { user },
        } = await authClient.auth.getUser();
        currentUserId = user?.id || null;
      } catch {}
    }

    let query = supabase
      .from('follow_ups')
      .select(
        '*, lead:leads(id, business_name, contact_person, phone), employee:profiles(id, full_name, employee_id)'
      )
      .order('scheduled_at', { ascending: true });

    // If logged in user is employee, or specific employee requested, filter strictly
    if (currentUserRole === 'employee' && currentUserId) {
      query = query.eq('employee_id', currentUserId);
    } else if (requestedEmpId) {
      query = query.eq('employee_id', requestedEmpId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ followups: [] });
    }

    const nowMs = Date.now();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const formatted = (data || []).map((f: any) => {
      const schedMs = new Date(f.scheduled_at).getTime();
      let computedStatus = f.status;

      if (f.status !== 'completed' && f.status !== 'cancelled') {
        if (schedMs < nowMs) {
          computedStatus = 'overdue';
        } else if (schedMs >= startOfToday.getTime() && schedMs <= endOfToday.getTime()) {
          computedStatus = 'due_today';
        } else {
          computedStatus = 'scheduled';
        }
      }

      return {
        id: f.id,
        leadId: f.lead_id,
        businessName: f.lead?.business_name || 'Unknown Business',
        contact: f.lead?.contact_person || 'Primary Contact',
        phone: f.lead?.phone || '—',
        time: f.scheduled_at,
        purpose: f.purpose || f.notes || 'Scheduled sales follow-up',
        assignedTo: f.employee
          ? `${f.employee.full_name} (${f.employee.employee_id})`
          : 'Unassigned',
        status: computedStatus,
      };
    });

    return NextResponse.json({ followups: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, followups: [] }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status = 'completed' } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Follow-up ID is required' }, { status: 400 });
    }

    const supabase = await getDbClient();
    const { data: updated, error } = await supabase
      .from('follow_ups')
      .update({
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (updated?.lead_id) {
      await supabase.from('lead_activities').insert({
        lead_id: updated.lead_id,
        employee_id: updated.employee_id,
        activity_type: 'followup_completed',
        description: `Scheduled follow-up marked as ${status}.`,
      });
    }

    invalidateCrmCache();

    return NextResponse.json({ success: true, followup: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
