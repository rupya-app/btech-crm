import { NextRequest, NextResponse } from 'next/server';
import {
  getDbClient,
  createServerSupabaseClient,
  invalidateCrmCache,
  fetchAllRows,
} from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await getDbClient();

    const [
      { data: employees },
      allLeads,
      activeAssignments,
      { data: activities },
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, employee_id, email, department, job_title, is_active')
        .eq('role', 'employee')
        .eq('is_active', true)
        .order('created_at', { ascending: true }),
      fetchAllRows((from, to) =>
        supabase.from('leads').select('id, status').range(from, to)
      ),
      fetchAllRows((from, to) =>
        supabase
          .from('lead_assignments')
          .select('lead_id, employee_id')
          .eq('is_active', true)
          .range(from, to)
      ),
      supabase.from('lead_activities').select('employee_id, activity_type, call_outcome'),
    ]);

    const assignedLeadIds = new Set(activeAssignments.map((a: any) => a.lead_id));
    const unassignedLeads = allLeads.filter(
      (l: any) => !assignedLeadIds.has(l.id) && l.status !== 'archived' && l.status !== 'unqualified'
    );

    const leadStatusMap = new Map<string, string>();
    allLeads.forEach((l: any) => leadStatusMap.set(l.id, l.status));

    const reps = (employees || []).map((emp: any) => {
      const empAssigns = activeAssignments.filter((a: any) => a.employee_id === emp.id);
      const activeCount = empAssigns.length;
      const confirmedCount = empAssigns.filter(
        (a: any) => leadStatusMap.get(a.lead_id) === 'confirmed'
      ).length;
      const pendingCount = empAssigns.filter((a: any) => {
        const st = leadStatusMap.get(a.lead_id);
        return st === 'pending' || st === 'follow_up' || st === 'new';
      }).length;
      const callsCount = (activities || []).filter(
        (act: any) =>
          act.employee_id === emp.id &&
          (act.activity_type === 'call_outcome' || Boolean(act.call_outcome))
      ).length;
      const conversionRate =
        activeCount > 0 ? Number(((confirmedCount / activeCount) * 100).toFixed(1)) : 0;

      return {
        id: emp.id,
        name: emp.full_name,
        empId: emp.employee_id,
        department: emp.department || 'Sales',
        activeLeads: activeCount,
        pendingLeads: pendingCount,
        callsMade: callsCount,
        confirmedDeals: confirmedCount,
        conversionRate,
      };
    });

    return NextResponse.json({
      unassignedCount: unassignedLeads.length,
      totalLeadsCount: allLeads.length,
      reps,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, unassignedCount: 0, reps: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      mode = 'workload',
      employeeId,
      count = 50,
      assignAll = false,
      leadIds,
      statusFilter,
    }: {
      mode?: 'single' | 'round_robin' | 'workload';
      employeeId?: string;
      count?: number;
      assignAll?: boolean;
      leadIds?: string[];
      statusFilter?: string;
    } = body;

    const supabase = await getDbClient();

    // Get current actor
    let actorId: string | null = null;
    try {
      const authClient = await createServerSupabaseClient();
      const {
        data: { user },
      } = await authClient.auth.getUser();
      actorId = user?.id || null;
    } catch {}

    // Fetch active employees
    const { data: employees } = await supabase
      .from('profiles')
      .select('id, full_name, employee_id')
      .eq('role', 'employee')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (!employees || employees.length === 0) {
      return NextResponse.json(
        { error: 'No active sales representatives found. Please add an employee first.' },
        { status: 400 }
      );
    }

    // 1. Fetch ALL active assignments and ALL leads across the entire database (no 1000-row truncation)
    const [activeAssignments, allLeads] = await Promise.all([
      fetchAllRows((from, to) =>
        supabase
          .from('lead_assignments')
          .select('lead_id, employee_id')
          .eq('is_active', true)
          .range(from, to)
      ),
      fetchAllRows((from, to) => {
        let q = supabase
          .from('leads')
          .select('id, status, normalized_phone, phone')
          .order('created_at', { ascending: false })
          .range(from, to);
        if (statusFilter && statusFilter !== 'all' && statusFilter !== 'unassigned') {
          q = q.eq('status', statusFilter);
        }
        return q;
      }),
    ]);

    // Set of all lead IDs that are ALREADY assigned to any sales person
    const assignedLeadIdSet = new Set<string>(
      activeAssignments.map((a: any) => a.lead_id)
    );

    // Map lead_id -> normalized_phone and build set of phones already assigned to a sales rep
    const leadById = new Map<string, any>();
    allLeads.forEach((l: any) => leadById.set(l.id, l));

    const assignedPhoneSet = new Set<string>();
    activeAssignments.forEach((a: any) => {
      const l = leadById.get(a.lead_id);
      const phoneKey = l?.normalized_phone || l?.phone;
      if (phoneKey) assignedPhoneSet.add(String(phoneKey).trim());
    });

    // 2. Determine strictly unassigned, non-duplicate target leads
    let targetLeadIds: string[] = [];
    let skippedAlreadyAssigned = 0;
    let skippedDuplicatePhone = 0;

    if (Array.isArray(leadIds) && leadIds.length > 0) {
      const uniqueInputIds = Array.from(new Set(leadIds));
      for (const id of uniqueInputIds) {
        if (assignedLeadIdSet.has(id)) {
          skippedAlreadyAssigned += 1;
          continue;
        }
        const leadObj = leadById.get(id);
        const phoneKey = leadObj?.normalized_phone || leadObj?.phone;
        if (phoneKey && assignedPhoneSet.has(String(phoneKey).trim())) {
          skippedDuplicatePhone += 1;
          continue;
        }
        if (phoneKey) assignedPhoneSet.add(String(phoneKey).trim());
        assignedLeadIdSet.add(id);
        targetLeadIds.push(id);
      }
    } else {
      const limitQty = assignAll
        ? allLeads.length
        : Math.max(1, Number(count) || 50);

      for (const l of allLeads) {
        if (targetLeadIds.length >= limitQty) break;
        if (l.status === 'archived' || l.status === 'unqualified') continue;

        // Strictly skip if this lead is already assigned to ANY sales representative
        if (assignedLeadIdSet.has(l.id)) {
          continue;
        }

        // Also prevent duplicate phone numbers from being assigned to multiple reps
        const phoneKey = l.normalized_phone || l.phone;
        if (phoneKey && assignedPhoneSet.has(String(phoneKey).trim())) {
          skippedDuplicatePhone += 1;
          continue;
        }

        if (phoneKey) assignedPhoneSet.add(String(phoneKey).trim());
        assignedLeadIdSet.add(l.id);
        targetLeadIds.push(l.id);
      }
    }

    if (targetLeadIds.length === 0) {
      return NextResponse.json(
        {
          error:
            skippedAlreadyAssigned > 0
              ? `All ${skippedAlreadyAssigned} selected lead(s) are already assigned to a sales representative. Duplicate assignment blocked.`
              : 'No unassigned leads available to allocate (all eligible leads are already assigned).',
        },
        { status: 400 }
      );
    }

    // 3. Calculate current workload per employee for balanced distribution
    const workloadMap = new Map<string, number>();
    employees.forEach((e: any) => workloadMap.set(e.id, 0));
    activeAssignments.forEach((a: any) => {
      if (workloadMap.has(a.employee_id)) {
        workloadMap.set(a.employee_id, (workloadMap.get(a.employee_id) || 0) + 1);
      }
    });

    const newAssignments: any[] = [];
    const activityRows: any[] = [];
    const perEmpCount = new Map<string, number>();
    const nowIso = new Date().toISOString();

    targetLeadIds.forEach((lId, idx) => {
      let chosenEmp = employees[0];

      if (mode === 'single' && employeeId) {
        chosenEmp = employees.find((e: any) => e.id === employeeId) || employees[0];
      } else if (mode === 'round_robin') {
        chosenEmp = employees[idx % employees.length];
      } else {
        // Workload balanced: pick employee with lowest current activeLeads
        let minLoad = Infinity;
        for (const emp of employees) {
          const load = workloadMap.get(emp.id) || 0;
          if (load < minLoad) {
            minLoad = load;
            chosenEmp = emp;
          }
        }
        workloadMap.set(chosenEmp.id, (workloadMap.get(chosenEmp.id) || 0) + 1);
      }

      perEmpCount.set(chosenEmp.id, (perEmpCount.get(chosenEmp.id) || 0) + 1);

      newAssignments.push({
        lead_id: lId,
        employee_id: chosenEmp.id,
        assigned_by: actorId,
        assignment_type: mode === 'single' ? 'admin_assigned' : 'bulk_assigned',
        assigned_at: nowIso,
        is_active: true,
      });

      activityRows.push({
        lead_id: lId,
        employee_id: chosenEmp.id,
        activity_type: 'lead_assigned',
        description: `Lead assigned exclusively to ${chosenEmp.full_name} (${chosenEmp.employee_id}) via ${mode.replace('_', ' ')} allocation.`,
      });
    });

    // 4. Insert in 250-row chunks (protected by database unique index idx_unique_active_lead_assignment)
    const CHUNK_SIZE = 250;
    for (let i = 0; i < newAssignments.length; i += CHUNK_SIZE) {
      const assignChunk = newAssignments.slice(i, i + CHUNK_SIZE);
      const { error: insertErr } = await supabase.from('lead_assignments').insert(assignChunk);
      if (insertErr) {
        return NextResponse.json(
          {
            error: insertErr.message.includes('idx_unique_active_lead_assignment')
              ? 'Concurrency lock: One or more leads were just assigned to another representative. Duplicate prevented.'
              : insertErr.message,
          },
          { status: 409 }
        );
      }
    }

    for (let i = 0; i < activityRows.length; i += CHUNK_SIZE) {
      const actChunk = activityRows.slice(i, i + CHUNK_SIZE);
      await supabase.from('lead_activities').insert(actChunk);
    }

    // Create notifications for each employee who received leads
    const notifications = Array.from(perEmpCount.entries()).map(([empId, assignedQty]) => ({
      user_id: empId,
      title: 'New Leads Assigned',
      message: `${assignedQty} unique lead${assignedQty > 1 ? 's have' : ' has'} been assigned exclusively to your pipeline queue.`,
      notification_type: 'lead_assigned',
    }));

    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications);
    }

    invalidateCrmCache();

    const skippedNote =
      skippedAlreadyAssigned > 0 || skippedDuplicatePhone > 0
        ? ` (${skippedAlreadyAssigned} already-assigned and ${skippedDuplicatePhone} duplicate-phone leads automatically skipped to prevent duplication.)`
        : '';

    return NextResponse.json({
      success: true,
      allocatedCount: targetLeadIds.length,
      skippedAlreadyAssigned,
      skippedDuplicatePhone,
      message:
        (mode === 'single'
          ? `Successfully allocated ${targetLeadIds.length} unique unassigned lead(s) exclusively to ${
              employees.find((e: any) => e.id === employeeId)?.full_name || employees[0].full_name
            }.`
          : `Successfully distributed ${targetLeadIds.length} unique unassigned lead(s) across ${perEmpCount.size} sales representative(s) with zero overlap.`) +
        skippedNote,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
