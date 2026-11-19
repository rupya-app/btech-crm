import { NextRequest, NextResponse } from 'next/server';
import { getDbClient, createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await getDbClient();
    let userId: string | null = null;

    try {
      const authClient = await createServerSupabaseClient();
      const {
        data: { user },
      } = await authClient.auth.getUser();
      userId = user?.id || null;
    } catch {}

    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(25);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const [{ data: notifications }, { data: dueFollowups }] = await Promise.all([
      query,
      supabase
        .from('follow_ups')
        .select('id, scheduled_at, purpose, status, lead_id, lead:leads(business_name, phone)')
        .neq('status', 'completed')
        .neq('status', 'cancelled')
        .order('scheduled_at', { ascending: true })
        .limit(10),
    ]);

    // Merge real callback reminders from follow_ups with stored notifications
    const callbackAlerts = (dueFollowups || []).map((f: any) => {
      const isOverdue = new Date(f.scheduled_at).getTime() < Date.now();
      return {
        id: `fu-${f.id}`,
        title: isOverdue
          ? `Overdue Callback: ${f.lead?.business_name || 'Client'}`
          : `Upcoming Callback: ${f.lead?.business_name || 'Client'}`,
        message: `${f.purpose || 'Scheduled call'} (${f.lead?.phone || ''}) at ${new Date(
          f.scheduled_at
        ).toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
        })}`,
        created_at: f.scheduled_at,
        is_read: false,
        link: `/admin/leads/${f.lead_id}`,
      };
    });

    const combined = [...callbackAlerts, ...(notifications || [])];
    return NextResponse.json({ notifications: combined });
  } catch (err: any) {
    return NextResponse.json({ notifications: [] });
  }
}

export async function PATCH() {
  try {
    const supabase = await getDbClient();
    let userId: string | null = null;

    try {
      const authClient = await createServerSupabaseClient();
      const {
        data: { user },
      } = await authClient.auth.getUser();
      userId = user?.id || null;
    } catch {}

    if (userId) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
    } else {
      await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
