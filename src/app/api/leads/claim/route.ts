import { NextRequest, NextResponse } from 'next/server';
import { getDbClient, createServerSupabaseClient, invalidateCrmCache } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { leadId } = await request.json();

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    const supabase = await getDbClient();
    let employeeId: string | null = null;
    let employeeName = 'Sales Representative';

    try {
      const authClient = await createServerSupabaseClient();
      const {
        data: { user },
      } = await authClient.auth.getUser();
      if (user?.id) {
        employeeId = user.id;
        const { data: prof } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        if (prof?.full_name) employeeName = prof.full_name;
      }
    } catch {}

    if (!employeeId) {
      const { data: firstEmp } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'employee')
        .limit(1)
        .single();
      if (firstEmp) {
        employeeId = firstEmp.id;
        employeeName = firstEmp.full_name;
      }
    }

    if (!employeeId) {
      return NextResponse.json(
        { error: 'No active employee profile found to claim this lead.' },
        { status: 400 }
      );
    }

    // Check if already claimed
    const { data: existing } = await supabase
      .from('lead_assignments')
      .select('id')
      .eq('lead_id', leadId)
      .eq('is_active', true)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'This lead has already been claimed by another representative.' },
        { status: 409 }
      );
    }

    const { data: lead } = await supabase
      .from('leads')
      .select('business_name')
      .eq('id', leadId)
      .single();

    const { error: assignErr } = await supabase.from('lead_assignments').insert({
      lead_id: leadId,
      employee_id: employeeId,
      assigned_by: employeeId,
      assignment_type: 'self_selected',
      assigned_at: new Date().toISOString(),
      is_active: true,
    });

    if (assignErr) {
      return NextResponse.json({ error: assignErr.message }, { status: 400 });
    }

    await supabase.from('lead_activities').insert({
      lead_id: leadId,
      employee_id: employeeId,
      activity_type: 'lead_claimed',
      description: `${employeeName} self-claimed this lead from the Unassigned Pool.`,
    });

    await supabase.from('notifications').insert({
      user_id: employeeId,
      title: 'Lead Claimed from Pool',
      message: `You have claimed "${lead?.business_name || 'Lead'}". Full contact details are now unlocked.`,
      notification_type: 'lead_assigned',
      related_entity_id: leadId,
      related_entity_type: 'lead',
    });

    invalidateCrmCache();

    return NextResponse.json({
      success: true,
      message: 'Lead claimed successfully! Added to your active queue.',
      leadId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to claim lead' },
      { status: 500 }
    );
  }
}
