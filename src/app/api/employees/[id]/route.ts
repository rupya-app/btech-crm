import { NextRequest, NextResponse } from 'next/server';
import { getDbClient, fetchAllRows } from '@/lib/supabase/server';
import { resolveAccountStatus } from '@/app/api/employees/route';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getDbClient();

    // 1. Fetch employee profile (by UUID or employee_id)
    let profileQuery = supabase.from('profiles').select('*');
    if (id.startsWith('EMP') || !id.includes('-')) {
      profileQuery = profileQuery.eq('employee_id', id.toUpperCase());
    } else {
      profileQuery = profileQuery.eq('id', id);
    }

    const { data: employee, error: empErr } = await profileQuery.single();
    if (empErr || !employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const empUuid = employee.id;
    const accountStatus = resolveAccountStatus(employee);

    // 2. Fetch all assignments (both active AND historical/reverted), activities, remarks, follow_ups
    const [
      empAssignments,
      allActiveAssignments,
      allLeads,
      { data: empActivities },
      { data: empRemarks },
      { data: empFollowUps },
    ] = await Promise.all([
      fetchAllRows((from, to) =>
        supabase
          .from('lead_assignments')
          .select('id, lead_id, assignment_type, assigned_at, released_at, is_active')
          .eq('employee_id', empUuid)
          .order('assigned_at', { ascending: false })
          .range(from, to)
      ),
      fetchAllRows((from, to) =>
        supabase.from('lead_assignments').select('lead_id').eq('is_active', true).range(from, to)
      ),
      fetchAllRows((from, to) =>
        supabase.from('leads').select('*').order('updated_at', { ascending: false }).range(from, to)
      ),
      supabase
        .from('lead_activities')
        .select('*, lead:leads(id, lead_number, business_name, contact_person, phone, status, category, city)')
        .eq('employee_id', empUuid)
        .order('created_at', { ascending: false }),
      supabase
        .from('lead_remarks')
        .select('*, lead:leads(id, lead_number, business_name, contact_person, phone, status)')
        .eq('employee_id', empUuid)
        .order('created_at', { ascending: false }),
      supabase
        .from('follow_ups')
        .select('*, lead:leads(id, lead_number, business_name, contact_person, phone, status)')
        .eq('employee_id', empUuid)
        .order('scheduled_at', { ascending: true }),
    ]);

    const leadMap = new Map<string, any>();
    (allLeads || []).forEach((l: any) => leadMap.set(l.id, l));

    const allAssignedLeadIds = new Set((allActiveAssignments || []).map((a: any) => a.lead_id));
    const unassignedPoolCount = (allLeads || []).filter(
      (l: any) => !allAssignedLeadIds.has(l.id) && l.status !== 'archived' && l.status !== 'unqualified'
    ).length;

    const activeAssignedLeads = (empAssignments || [])
      .filter((a: any) => a.is_active)
      .map((a: any) => {
        const lead = leadMap.get(a.lead_id);
        if (!lead) return null;
        return {
          ...lead,
          assigned_at: a.assigned_at,
          released_at: null,
          is_reverted: false,
          assignment_type: a.assignment_type,
        };
      })
      .filter(Boolean);

    const revertedHistoricalLeads = (empAssignments || [])
      .filter((a: any) => !a.is_active)
      .map((a: any) => {
        const lead = leadMap.get(a.lead_id);
        if (!lead) return null;
        return {
          ...lead,
          assigned_at: a.assigned_at,
          released_at: a.released_at,
          is_reverted: true,
          assignment_type: a.assignment_type,
        };
      })
      .filter(Boolean);

    // If employee is deactivated (so activeAssignedLeads is 0), include their historical leads in assignedLeads view so history is 100% inspectable
    const assignedLeads =
      activeAssignedLeads.length > 0
        ? [...activeAssignedLeads, ...revertedHistoricalLeads]
        : revertedHistoricalLeads;

    // 3. Compute KPI stats & Stage Breakdown
    const stageBreakdown: Record<string, number> = {
      new: 0,
      contacted: 0,
      interested: 0,
      follow_up: 0,
      pending: 0,
      confirmed: 0,
      not_interested: 0,
      unqualified: 0,
      archived: 0,
    };

    assignedLeads.forEach((l: any) => {
      const st = l.status === 'invalid' ? 'unqualified' : l.status;
      if (st in stageBreakdown) {
        stageBreakdown[st] += 1;
      }
    });

    const activities = empActivities || [];
    const remarks = empRemarks || [];
    const followUps = empFollowUps || [];

    const calls = activities.filter(
      (a: any) => a.activity_type === 'call_outcome' || Boolean(a.call_outcome)
    );

    const markings = activities.filter(
      (a: any) =>
        a.activity_type === 'status_changed' ||
        a.activity_type === 'call_outcome' ||
        a.activity_type === 'lead_confirmed'
    );

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodayMs = startOfToday.getTime();
    const nowMs = Date.now();

    const callsToday = calls.filter(
      (c: any) => new Date(c.created_at).getTime() >= startOfTodayMs
    ).length;

    const outcomeBreakdown: Record<string, number> = {};
    calls.forEach((c: any) => {
      const k = c.call_outcome || 'connected';
      outcomeBreakdown[k] = (outcomeBreakdown[k] || 0) + 1;
    });

    const totalAssigned = assignedLeads.length;
    const contactedLeads = assignedLeads.filter((l: any) => l.status !== 'new').length;
    const confirmedLeads = stageBreakdown.confirmed;
    const pendingLeads = stageBreakdown.pending + stageBreakdown.follow_up + stageBreakdown.new;
    const interestedLeads = stageBreakdown.interested;

    const activeFollowUps = followUps.filter(
      (f: any) => f.status !== 'completed' && f.status !== 'cancelled'
    );
    const overdueFollowUps = activeFollowUps.filter(
      (f: any) => new Date(f.scheduled_at).getTime() < nowMs
    ).length;

    const conversionRate =
      totalAssigned > 0 ? Number(((confirmedLeads / totalAssigned) * 100).toFixed(1)) : 0;
    const contactRate =
      totalAssigned > 0 ? Number(((contactedLeads / totalAssigned) * 100).toFixed(1)) : 0;

    // 4. Build Day-by-Day Work Log ("what they have done every day")
    // Combine activities and remarks into daily buckets (in Asia/Kolkata IST)
    interface DailyBucket {
      dateKey: string;
      dateLabel: string;
      callsCount: number;
      markingsCount: number;
      remarksCount: number;
      confirmedCount: number;
      followupsCount: number;
      assignedCount: number;
      events: Array<{
        id: string;
        time: string;
        type: 'call' | 'marking' | 'remark' | 'followup' | 'assignment';
        title: string;
        description: string;
        callOutcome?: string | null;
        durationSeconds?: number;
        leadId?: string;
        leadNumber?: number;
        businessName?: string;
        phone?: string;
        leadStatus?: string;
      }>;
    }

    const dayMap = new Map<string, DailyBucket>();

    const getDayKeyAndLabel = (isoDate: string) => {
      const d = new Date(isoDate);
      const dateKey = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
      const todayKey = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      const yesterdayDate = new Date(Date.now() - 86400000);
      const yesterdayKey = yesterdayDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

      const formatted = d.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      let dateLabel = formatted;
      if (dateKey === todayKey) dateLabel = `Today • ${formatted}`;
      else if (dateKey === yesterdayKey) dateLabel = `Yesterday • ${formatted}`;

      return { dateKey, dateLabel };
    };

    const ensureBucket = (isoDate: string): DailyBucket => {
      const { dateKey, dateLabel } = getDayKeyAndLabel(isoDate);
      if (!dayMap.has(dateKey)) {
        dayMap.set(dateKey, {
          dateKey,
          dateLabel,
          callsCount: 0,
          markingsCount: 0,
          remarksCount: 0,
          confirmedCount: 0,
          followupsCount: 0,
          assignedCount: 0,
          events: [],
        });
      }
      return dayMap.get(dateKey)!;
    };

    activities.forEach((act: any) => {
      const bucket = ensureBucket(act.created_at);
      const isCall = act.activity_type === 'call_outcome' || Boolean(act.call_outcome);
      const isStatus = act.activity_type === 'status_changed';
      const isFollowup = act.activity_type.includes('followup');
      const isAssign = act.activity_type.includes('assign') || act.activity_type.includes('claim');
      const isRemark = act.activity_type === 'remark_added';

      if (isCall) bucket.callsCount += 1;
      if (isStatus || isCall) bucket.markingsCount += 1;
      if (isRemark) bucket.remarksCount += 1;
      if (isFollowup) bucket.followupsCount += 1;
      if (isAssign) bucket.assignedCount += 1;
      if (
        act.description?.toLowerCase().includes('confirmed') ||
        act.metadata?.confirmed
      ) {
        bucket.confirmedCount += 1;
      }

      bucket.events.push({
        id: act.id,
        time: act.created_at,
        type: isCall
          ? 'call'
          : isStatus
          ? 'marking'
          : isRemark
          ? 'remark'
          : isFollowup
          ? 'followup'
          : 'assignment',
        title: isCall
          ? `Phone Call (${(act.call_outcome || 'connected').replace(/_/g, ' ')})`
          : isStatus
          ? 'Pipeline Stage Marking Updated'
          : isRemark
          ? 'Call Remark / Note Logged'
          : isFollowup
          ? 'Follow-up Scheduled'
          : 'Lead Assigned to Queue',
        description: act.description || '',
        callOutcome: act.call_outcome,
        durationSeconds: act.duration_seconds,
        leadId: act.lead?.id || act.lead_id,
        leadNumber: act.lead?.lead_number,
        businessName: act.lead?.business_name,
        phone: act.lead?.phone,
        leadStatus: act.lead?.status,
      });
    });

    const dailyHistory = Array.from(dayMap.values()).sort((a, b) =>
      b.dateKey.localeCompare(a.dateKey)
    );

    return NextResponse.json({
      employee: {
        ...employee,
        account_status: accountStatus,
      },
      unassignedPoolCount,
      stats: {
        totalAssigned: activeAssignedLeads.length,
        revertedLeadsCount: revertedHistoricalLeads.length,
        totalHistoricalHandled: assignedLeads.length,
        contactedLeads,
        interestedLeads,
        pendingLeads,
        confirmedLeads,
        notInterestedLeads: stageBreakdown.not_interested,
        disqualifiedLeads: stageBreakdown.unqualified,
        totalCalls: calls.length,
        callsToday,
        totalRemarks: remarks.length,
        followUpsScheduled: activeFollowUps.length,
        overdueFollowUps,
        conversionRate,
        contactRate,
        stageBreakdown,
        outcomeBreakdown,
      },
      dailyHistory,
      calls,
      markings,
      remarks,
      followUps,
      assignedLeads,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
