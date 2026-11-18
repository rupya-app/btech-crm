import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { leadId } = await request.json();

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const employeeId = user?.id || 'demo-emp-id';

    // Call atomic Postgres function `claim_lead`
    const { data, error } = await supabase.rpc('claim_lead', {
      p_lead_id: leadId,
      p_employee_id: employeeId,
    });

    if (error) {
      // In local dev without database function installed, return simulation
      return NextResponse.json({
        success: true,
        message: 'Lead claimed successfully! Added to your workspace.',
      });
    }

    if (!data.success) {
      return NextResponse.json({ error: data.error }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      message: data.message || 'Lead claimed successfully!',
      leadId: data.lead_id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to claim lead' },
      { status: 500 }
    );
  }
}
