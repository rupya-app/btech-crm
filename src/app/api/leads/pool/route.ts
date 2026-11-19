import { NextResponse } from 'next/server';
import { getDbClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await getDbClient();

    const [{ data: activeAssigns }, { data: allLeads }] = await Promise.all([
      supabase.from('lead_assignments').select('lead_id').eq('is_active', true),
      supabase
        .from('leads')
        .select('id, lead_number, business_name, category, city, state, source, status, created_at')
        .order('created_at', { ascending: false }),
    ]);

    const assignedSet = new Set((activeAssigns || []).map((a: any) => a.lead_id));
    const poolLeads = (allLeads || []).filter(
      (l: any) => !assignedSet.has(l.id) && l.status !== 'archived' && l.status !== 'unqualified'
    );

    return NextResponse.json({ leads: poolLeads });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, leads: [] }, { status: 500 });
  }
}
