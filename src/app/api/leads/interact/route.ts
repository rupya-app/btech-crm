import { NextRequest, NextResponse } from 'next/server';
import { getDbClient, createServerSupabaseClient, invalidateCrmCache } from '@/lib/supabase/server';
import { statusLabels } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      leadId,
      action,
      remark,
      status,
      callOutcome,
      durationSeconds = 180,
      scheduledAt,
      purpose,
    } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    const supabase = await getDbClient();

    // Resolve current user profile
    let employeeId: string | null = null;
    let employeeProfile: any = null;

    try {
      const authClient = await createServerSupabaseClient();
      const {
        data: { user },
      } = await authClient.auth.getUser();
      if (user?.id) {
        employeeId = user.id;
        const { data: prof } = await supabase
          .from('profiles')
          .select('id, full_name, employee_id, role')
          .eq('id', user.id)
          .single();
        employeeProfile = prof;
      }
    } catch {}

    if (!employeeId) {
      const { data: fallbackProf } = await supabase
        .from('profiles')
        .select('id, full_name, employee_id, role')
        .limit(1)
        .single();
      if (fallbackProf) {
        employeeId = fallbackProf.id;
        employeeProfile = fallbackProf;
      }
    }

    const { data: leadData } = await supabase
      .from('leads')
      .select('id, business_name, status')
      .eq('id', leadId)
      .single();

    // 1. ADD REMARK
    if (action === 'add_remark') {
      if (!remark || !remark.trim()) {
        return NextResponse.json({ error: 'Remark text is required' }, { status: 400 });
      }

      const { data: insertedRemark, error: remErr } = await supabase
        .from('lead_remarks')
        .insert({
          lead_id: leadId,
          employee_id: employeeId,
          remark: remark.trim(),
        })
        .select('*, employee:profiles(id, full_name, employee_id)')
        .single();

      if (remErr) {
        return NextResponse.json({ error: remErr.message }, { status: 400 });
      }

      const { data: insertedActivity } = await supabase
        .from('lead_activities')
        .insert({
          lead_id: leadId,
          employee_id: employeeId,
          activity_type: 'remark_added',
          description: `Remark added: "${remark.trim()}"`,
        })
        .select('*, employee:profiles(id, full_name, employee_id)')
        .single();

      return NextResponse.json({
        success: true,
        remark: insertedRemark || {
          id: `rem-${Date.now()}`,
          lead_id: leadId,
          employee_id: employeeId,
          remark: remark.trim(),
          created_at: new Date().toISOString(),
          employee: employeeProfile,
        },
        activity: insertedActivity,
      });
    }

    // 2. UPDATE STATUS / CALL OUTCOME
    if (action === 'update_status') {
      const newStatus = status || leadData?.status || 'contacted';
      const updatePayload: Record<string, any> = {
        status: newStatus,
        last_contacted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (newStatus === 'confirmed') {
        updatePayload.confirmed_at = new Date().toISOString();
      } else if (newStatus === 'archived') {
        updatePayload.archived_at = new Date().toISOString();
      }

      const { error: leadErr } = await supabase
        .from('leads')
        .update(updatePayload)
        .eq('id', leadId);

      if (leadErr) {
        return NextResponse.json({ error: leadErr.message }, { status: 400 });
      }

      const isCall = Boolean(callOutcome);
      const desc =
        remark && remark.trim()
          ? remark.trim()
          : `Pipeline status updated to ${statusLabels[newStatus] || newStatus}`;

      const { data: insertedActivity } = await supabase
        .from('lead_activities')
        .insert({
          lead_id: leadId,
          employee_id: employeeId,
          activity_type: isCall ? 'call_outcome' : 'status_changed',
          call_outcome: callOutcome || null,
          duration_seconds: isCall ? durationSeconds : 0,
          description: desc,
        })
        .select('*, employee:profiles(id, full_name, employee_id)')
        .single();

      let insertedRemark = null;
      if (remark && remark.trim() && employeeId) {
        const { data: rem } = await supabase
          .from('lead_remarks')
          .insert({
            lead_id: leadId,
            employee_id: employeeId,
            remark: `[Stage: ${statusLabels[newStatus] || newStatus}] ${remark.trim()}`,
          })
          .select('*, employee:profiles(id, full_name, employee_id)')
          .single();
        insertedRemark = rem;
      }

      // If Call Back Requested or Confirmed Deal, create a notification!
      if (employeeId && (callOutcome === 'call_back' || newStatus === 'confirmed')) {
        await supabase.from('notifications').insert({
          user_id: employeeId,
          title:
            newStatus === 'confirmed'
              ? `Deal Confirmed: ${leadData?.business_name || 'Lead'}`
              : `Callback Reminder: ${leadData?.business_name || 'Lead'}`,
          message:
            newStatus === 'confirmed'
              ? `Congratulations! "${leadData?.business_name || 'Lead'}" has been marked as Confirmed Won.`
              : `Call outcome logged as "Call Back Requested" for "${leadData?.business_name || 'Lead'}".`,
          notification_type: newStatus === 'confirmed' ? 'deal_confirmed' : 'callback_reminder',
          related_entity_id: leadId,
          related_entity_type: 'lead',
        });
      }

      invalidateCrmCache();

      return NextResponse.json({
        success: true,
        status: newStatus,
        activity: insertedActivity,
        remark: insertedRemark,
      });
    }

    // 3. SCHEDULE FOLLOW-UP
    if (action === 'schedule_followup') {
      if (!scheduledAt) {
        return NextResponse.json({ error: 'Scheduled date/time is required' }, { status: 400 });
      }

      const { data: followupRow, error: fuErr } = await supabase
        .from('follow_ups')
        .insert({
          lead_id: leadId,
          employee_id: employeeId,
          scheduled_at: scheduledAt,
          purpose: purpose || 'Scheduled sales follow-up call',
          status: 'scheduled',
        })
        .select('*')
        .single();

      if (fuErr) {
        return NextResponse.json({ error: fuErr.message }, { status: 400 });
      }

      // Update lead status to follow_up if not already confirmed
      if (leadData?.status !== 'confirmed') {
        await supabase
          .from('leads')
          .update({ status: 'follow_up', updated_at: new Date().toISOString() })
          .eq('id', leadId);
      }

      const { data: insertedActivity } = await supabase
        .from('lead_activities')
        .insert({
          lead_id: leadId,
          employee_id: employeeId,
          activity_type: 'followup_scheduled',
          description: `Follow-up scheduled for ${new Date(scheduledAt).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
          })}: "${purpose || 'General discussion'}"`,
          metadata: { scheduled_at: scheduledAt },
        })
        .select('*, employee:profiles(id, full_name, employee_id)')
        .single();

      // Create callback notification
      if (employeeId) {
        await supabase.from('notifications').insert({
          user_id: employeeId,
          title: `Callback Scheduled: ${leadData?.business_name || 'Client'}`,
          message: `Reminder set for ${new Date(scheduledAt).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short',
          })} — ${purpose || 'Follow-up call'}`,
          notification_type: 'followup_scheduled',
          related_entity_id: leadId,
          related_entity_type: 'lead',
        });
      }

      invalidateCrmCache();

      return NextResponse.json({
        success: true,
        followup: followupRow,
        activity: insertedActivity,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
