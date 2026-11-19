import { NextRequest, NextResponse } from 'next/server';
import { getDbClient, createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const authClient = await createServerSupabaseClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    const supabase = await getDbClient();

    if (user?.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        return NextResponse.json({ profile });
      }
    }

    const { data: fallbackProfile } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
      .single();

    return NextResponse.json({ profile: fallbackProfile || null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, profile: null }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { fullName, phone } = await request.json();
    const authClient = await createServerSupabaseClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = await getDbClient();
    const { data: updated, error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName?.trim(),
        phone: phone?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, profile: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
