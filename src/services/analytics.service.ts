import { getDbClient, createServerSupabaseClient, getCachedOrFetch } from '@/lib/supabase/server';
import { EmployeePerformance } from '@/types';

export interface AdminKPIs {
  totalLeads: number;
  assignedLeads: number;
  unassignedLeads: number;
  newLeads: number;
  contactedLeads: number;
  interestedLeads: number;
  followUpLeads: number;
  pendingLeads: number;
  confirmedLeads: number;
  notInterestedLeads: number;
  followUpsDueToday: number;
  overdueFollowUps: number;
  totalEmployees: number;
}

export interface PipelineStage {
  status: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export async function getAdminKPIs(): Promise<AdminKPIs> {
  return getCachedOrFetch('admin_kpis', 15000, async () => {
    try {
    const supabase = await getDbClient();

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      { data: allLeads },
      { data: activeAssignments },
      { data: activeProfiles },
      { data: activeFollowUps },
    ] = await Promise.all([
      supabase.from('leads').select('id, status'),
      supabase.from('lead_assignments').select('lead_id, employee_id').eq('is_active', true),
      supabase
        .from('profiles')
        .select('id')
        .eq('role', 'employee')
        .eq('is_active', true),
      supabase
        .from('follow_ups')
        .select('id, scheduled_at, status')
        .neq('status', 'completed')
        .neq('status', 'cancelled'),
    ]);

    const activeEmpSet = new Set((activeProfiles || []).map((p: any) => p.id));
    const validAssigns = (activeAssignments || []).filter((a: any) => activeEmpSet.has(a.employee_id));
    const employeesCount = activeProfiles?.length || 0;

    const leads = allLeads || [];
    const assignedSet = new Set(validAssigns.map((a: any) => a.lead_id));

    const totalLeads = leads.length;
    const assignedLeads = leads.filter((l: any) => assignedSet.has(l.id)).length;
    const unassignedLeads = leads.filter(
      (l: any) => !assignedSet.has(l.id) && l.status !== 'archived' && l.status !== 'unqualified'
    ).length;

    const countByStatus = (st: string) => leads.filter((l: any) => l.status === st).length;

    const nowMs = Date.now();
    const startMs = startOfToday.getTime();
    const endMs = endOfToday.getTime();

    let followUpsDueToday = 0;
    let overdueFollowUps = 0;

    (activeFollowUps || []).forEach((f: any) => {
      const t = new Date(f.scheduled_at).getTime();
      if (f.status === 'overdue' || t < nowMs) {
        overdueFollowUps += 1;
      }
      if ((t >= startMs && t <= endMs) || f.status === 'due_today' || t < nowMs) {
        followUpsDueToday += 1;
      }
    });

    return {
      totalLeads,
      assignedLeads,
      unassignedLeads,
      newLeads: countByStatus('new'),
      contactedLeads: countByStatus('contacted'),
      interestedLeads: countByStatus('interested'),
      followUpLeads: countByStatus('follow_up'),
      pendingLeads: countByStatus('pending'),
      confirmedLeads: countByStatus('confirmed'),
      notInterestedLeads: countByStatus('not_interested'),
      followUpsDueToday,
      overdueFollowUps,
      totalEmployees: employeesCount ?? 0,
    };
  } catch (err) {
    console.error('getAdminKPIs error:', err);
    return {
      totalLeads: 0,
      assignedLeads: 0,
      unassignedLeads: 0,
      newLeads: 0,
      contactedLeads: 0,
      interestedLeads: 0,
      followUpLeads: 0,
      pendingLeads: 0,
      confirmedLeads: 0,
      notInterestedLeads: 0,
      followUpsDueToday: 0,
      overdueFollowUps: 0,
      totalEmployees: 0,
    };
  }
  });
}

export async function getPipelineDistribution(): Promise<PipelineStage[]> {
  const kpis = await getAdminKPIs();
  const total = kpis.totalLeads || 1;

  return [
    {
      status: 'new',
      label: 'New Inquiries',
      count: kpis.newLeads,
      percentage: Math.round((kpis.newLeads / total) * 100),
      color: '#0EA5E9',
    },
    {
      status: 'contacted',
      label: 'Contacted',
      count: kpis.contactedLeads,
      percentage: Math.round((kpis.contactedLeads / total) * 100),
      color: '#3B82F6',
    },
    {
      status: 'interested',
      label: 'Interested',
      count: kpis.interestedLeads,
      percentage: Math.round((kpis.interestedLeads / total) * 100),
      color: '#14B8A6',
    },
    {
      status: 'pending',
      label: 'Pending Decision',
      count: kpis.pendingLeads + kpis.followUpLeads,
      percentage: Math.round(((kpis.pendingLeads + kpis.followUpLeads) / total) * 100),
      color: '#F59E0B',
    },
    {
      status: 'confirmed',
      label: 'Confirmed Won',
      count: kpis.confirmedLeads,
      percentage: Math.round((kpis.confirmedLeads / total) * 100),
      color: '#10B981',
    },
    {
      status: 'not_interested',
      label: 'Closed Lost',
      count: kpis.notInterestedLeads,
      percentage: Math.round((kpis.notInterestedLeads / total) * 100),
      color: '#F43F5E',
    },
  ];
}

export async function getEmployeeRankings(): Promise<EmployeePerformance[]> {
  return getCachedOrFetch('employee_rankings', 15000, async () => {
  try {
    const supabase = await getDbClient();

    const [
      { data: employees },
      { data: assignments },
      { data: leads },
      { data: followUps },
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, employee_id')
        .eq('role', 'employee')
        .order('created_at', { ascending: true }),
      supabase
        .from('lead_assignments')
        .select('lead_id, employee_id')
        .eq('is_active', true),
      supabase.from('leads').select('id, status'),
      supabase.from('follow_ups').select('id, employee_id, status, scheduled_at'),
    ]);

    if (!employees || employees.length === 0) {
      return [];
    }

    const leadMap = new Map<string, string>();
    (leads || []).forEach((l: any) => leadMap.set(l.id, l.status));

    const nowMs = Date.now();

    const rankings: EmployeePerformance[] = employees.map((emp: any) => {
      const empAssigns = (assignments || []).filter((a: any) => a.employee_id === emp.id);
      const assignedLeads = empAssigns.length;

      let contactedLeads = 0;
      let interestedLeads = 0;
      let confirmedLeads = 0;
      let pendingLeads = 0;

      empAssigns.forEach((a: any) => {
        const st = leadMap.get(a.lead_id);
        if (st && st !== 'new') contactedLeads += 1;
        if (st === 'interested') interestedLeads += 1;
        if (st === 'confirmed') confirmedLeads += 1;
        if (st === 'pending' || st === 'follow_up') pendingLeads += 1;
      });

      const empFollowUps = (followUps || []).filter((f: any) => f.employee_id === emp.id);
      const followUpsCompleted = empFollowUps.filter((f: any) => f.status === 'completed').length;
      const overdueFollowUps = empFollowUps.filter(
        (f: any) =>
          f.status !== 'completed' &&
          f.status !== 'cancelled' &&
          new Date(f.scheduled_at).getTime() < nowMs
      ).length;

      const conversionRate =
        assignedLeads > 0 ? Number(((confirmedLeads / assignedLeads) * 100).toFixed(1)) : 0;
      const contactRate =
        assignedLeads > 0 ? Number(((contactedLeads / assignedLeads) * 100).toFixed(1)) : 0;

      return {
        employee: emp,
        assignedLeads,
        contactedLeads,
        interestedLeads,
        confirmedLeads,
        pendingLeads,
        followUpsCompleted,
        overdueFollowUps,
        conversionRate,
        contactRate,
      };
    });

    return rankings.sort((a, b) => b.confirmedLeads - a.confirmedLeads || b.assignedLeads - a.assignedLeads);
  } catch (err) {
    console.error('getEmployeeRankings error:', err);
    return [];
  }
  });
}

export async function getEmployeePersonalKPIs(employeeId?: string) {
  try {
    const supabase = await getDbClient();
    let targetEmpId = employeeId;

    if (!targetEmpId || targetEmpId === 'emp-current') {
      try {
        const authClient = await createServerSupabaseClient();
        const {
          data: { user },
        } = await authClient.auth.getUser();
        if (user?.id) {
          targetEmpId = user.id;
        }
      } catch {}
    }

    if (!targetEmpId || targetEmpId === 'emp-current') {
      const { data: firstEmp } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'employee')
        .limit(1)
        .single();
      targetEmpId = firstEmp?.id;
    }

    const [
      { data: allLeads },
      { data: allAssigns },
      { data: todayActivities },
      { data: empFollowUps },
    ] = await Promise.all([
      supabase.from('leads').select('id, status'),
      supabase.from('lead_assignments').select('lead_id, employee_id').eq('is_active', true),
      supabase
        .from('lead_activities')
        .select('id, employee_id, activity_type, created_at')
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
      targetEmpId
        ? supabase
            .from('follow_ups')
            .select('id, status, scheduled_at')
            .eq('employee_id', targetEmpId)
            .neq('status', 'completed')
            .neq('status', 'cancelled')
        : Promise.resolve({ data: [] }),
    ]);

    const assignedSet = new Set((allAssigns || []).map((a: any) => a.lead_id));
    const availablePoolLeads = (allLeads || []).filter(
      (l: any) => !assignedSet.has(l.id) && l.status !== 'archived' && l.status !== 'unqualified'
    ).length;

    const myLeadIds = new Set(
      (allAssigns || [])
        .filter((a: any) => !targetEmpId || a.employee_id === targetEmpId)
        .map((a: any) => a.lead_id)
    );

    const myLeads = (allLeads || []).filter((l: any) => myLeadIds.has(l.id));
    const myAssignedLeads = myLeads.length;
    const contactedLeads = myLeads.filter((l: any) => l.status !== 'new').length;
    const interestedLeads = myLeads.filter((l: any) => l.status === 'interested').length;
    const pendingLeads = myLeads.filter(
      (l: any) => l.status === 'pending' || l.status === 'follow_up'
    ).length;
    const confirmedLeads = myLeads.filter((l: any) => l.status === 'confirmed').length;

    const callsToday = (todayActivities || []).filter(
      (a: any) => (!targetEmpId || a.employee_id === targetEmpId) && a.activity_type === 'call_outcome'
    ).length;

    const followUpsDue = (empFollowUps || []).length;

    const conversionRate =
      myAssignedLeads > 0 ? Number(((confirmedLeads / myAssignedLeads) * 100).toFixed(1)) : 0;
    const contactRate =
      myAssignedLeads > 0 ? Number(((contactedLeads / myAssignedLeads) * 100).toFixed(1)) : 0;

    return {
      myAssignedLeads,
      availablePoolLeads,
      callsToday,
      contactedLeads,
      interestedLeads,
      pendingLeads,
      followUpsDue,
      confirmedLeads,
      conversionRate,
      contactRate,
    };
  } catch (err) {
    console.error('getEmployeePersonalKPIs error:', err);
    return {
      myAssignedLeads: 0,
      availablePoolLeads: 0,
      callsToday: 0,
      contactedLeads: 0,
      interestedLeads: 0,
      pendingLeads: 0,
      followUpsDue: 0,
      confirmedLeads: 0,
      conversionRate: 0,
      contactRate: 0,
    };
  }
}

export async function getAnalyticsBreakdown() {
  try {
    const supabase = await getDbClient();
    const [{ data: leads }, { data: activities }] = await Promise.all([
      supabase.from('leads').select('id, source, status'),
      supabase
        .from('lead_activities')
        .select('id, call_outcome')
        .not('call_outcome', 'is', null),
    ]);

    const sourceMap = new Map<string, { total: number; confirmed: number }>();
    (leads || []).forEach((l: any) => {
      const src = l.source || 'Direct / Excel Import';
      const entry = sourceMap.get(src) || { total: 0, confirmed: 0 };
      entry.total += 1;
      if (l.status === 'confirmed') entry.confirmed += 1;
      sourceMap.set(src, entry);
    });

    const colors = ['bg-primary-600', 'bg-accent-blue', 'bg-warning', 'bg-success', 'bg-purple-600'];
    const sources = Array.from(sourceMap.entries())
      .map(([source, stats], idx) => {
        const pct = stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0;
        return {
          source,
          count: stats.total,
          rate: `${pct}%`,
          widthPct: Math.max(8, Math.min(100, Math.round((stats.total / Math.max(1, (leads || []).length)) * 100))),
          color: colors[idx % colors.length],
        };
      })
      .sort((a, b) => b.count - a.count);

    const outcomeLabels: Record<string, { label: string; color: string }> = {
      connected: { label: 'Connected / Pitch Completed', color: '#10B981' },
      call_back: { label: 'Call Back Requested', color: '#147D72' },
      busy: { label: 'Busy Line', color: '#F59E0B' },
      no_answer: { label: 'Ringing Unanswered', color: '#6366F1' },
      not_reachable: { label: 'Not Reachable / Switched Off', color: '#64748B' },
      switched_off: { label: 'Switched Off', color: '#64748B' },
      wrong_number: { label: 'Wrong Number / Invalid', color: '#EF4444' },
      other: { label: 'Other Outcome', color: '#8B5CF6' },
    };

    const outcomeCounts = new Map<string, number>();
    (activities || []).forEach((a: any) => {
      const k = a.call_outcome || 'other';
      outcomeCounts.set(k, (outcomeCounts.get(k) || 0) + 1);
    });

    const totalCalls = Math.max(1, (activities || []).length);
    const callOutcomes = Array.from(outcomeCounts.entries())
      .map(([key, count]) => ({
        label: outcomeLabels[key]?.label || key,
        count,
        pct: Math.round((count / totalCalls) * 100),
        color: outcomeLabels[key]?.color || '#147D72',
      }))
      .sort((a, b) => b.count - a.count);

    return { sources, callOutcomes, totalCalls: (activities || []).length };
  } catch (err) {
    return { sources: [], callOutcomes: [], totalCalls: 0 };
  }
}
