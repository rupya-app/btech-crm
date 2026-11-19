import {
  getDbClient,
  createServerSupabaseClient,
  getCachedOrFetch,
  fetchAllRows,
} from '@/lib/supabase/server';
import { Lead, LeadFilterParams, PaginatedResponse, LeadActivity, LeadRemark } from '@/types';

export interface LeadStatusCounts {
  all: number;
  unassigned: number;
  new: number;
  contacted: number;
  interested: number;
  follow_up: number;
  pending: number;
  confirmed: number;
  not_interested: number;
  unqualified: number;
  archived: number;
}

export async function getLeads(
  params: LeadFilterParams & { employeeId?: string } = {}
): Promise<PaginatedResponse<Lead>> {
  const page = params.page || 1;
  const pageSize = params.pageSize || 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    const supabase = await getDbClient();

    // Fetch all active assignments with employee profile info (handles >1000 rows)
    const allActiveAssigns = await fetchAllRows<any>((rFrom, rTo) =>
      supabase
        .from('lead_assignments')
        .select('lead_id, employee_id, employee:profiles!lead_assignments_employee_id_fkey(id, full_name, employee_id)')
        .eq('is_active', true)
        .range(rFrom, rTo)
    );

    const assignmentByLeadId = new Map<string, any>();
    allActiveAssigns.forEach((a: any) => {
      assignmentByLeadId.set(a.lead_id, a.employee || { id: a.employee_id, full_name: 'Assigned Rep', employee_id: '' });
    });

    const statusStr = params.status ? String(params.status).toLowerCase() : 'all';

    if (params.employeeId) {
      const empLeadIds = allActiveAssigns
        .filter((a: any) => a.employee_id === params.employeeId)
        .map((a: any) => a.lead_id);

      if (empLeadIds.length === 0) {
        return {
          data: [],
          total: 0,
          page,
          pageSize,
          totalPages: 1,
          hasMore: false,
        };
      }

      let query = supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .in('id', empLeadIds);

      if (params.status && statusStr !== 'all' && statusStr !== 'unassigned') {
        query = query.eq('status', statusStr);
      }

      if (params.search && params.search.trim().length > 0) {
        const s = params.search.trim();
        query = query.or(
          `business_name.ilike.%${s}%,contact_person.ilike.%${s}%,phone.ilike.%${s}%,email.ilike.%${s}%,city.ilike.%${s}%,category.ilike.%${s}%`
        );
      }

      const sortBy = params.sortBy || 'created_at';
      const ascending = params.sortOrder === 'asc';
      const { data, count } = await query.order(sortBy, { ascending }).range(from, to);

      const rows = (data || []).map((l: any) => ({
        ...l,
        assigned_rep: assignmentByLeadId.get(l.id) || null,
      }));
      const total = count ?? rows.length;

      return {
        data: rows,
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        hasMore: page * pageSize < total,
      };
    }

    // For Unassigned Pool view when there can be 1,000+ leads
    if (statusStr === 'unassigned') {
      const allLeads = await fetchAllRows<any>((rFrom, rTo) => {
        let q = supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })
          .range(rFrom, rTo);
        if (params.search && params.search.trim().length > 0) {
          const s = params.search.trim();
          q = q.or(
            `business_name.ilike.%${s}%,contact_person.ilike.%${s}%,phone.ilike.%${s}%,email.ilike.%${s}%,city.ilike.%${s}%,category.ilike.%${s}%`
          );
        }
        return q;
      });

      const unassignedRows = allLeads.filter(
        (l: any) =>
          !assignmentByLeadId.has(l.id) &&
          l.status !== 'archived' &&
          l.status !== 'unqualified'
      );

      const total = unassignedRows.length;
      const paged = unassignedRows.slice(from, to + 1).map((l: any) => ({
        ...l,
        assigned_rep: null,
      }));

      return {
        data: paged,
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        hasMore: page * pageSize < total,
      };
    }

    let query = supabase.from('leads').select('*', { count: 'exact' });

    // Status filter
    if (params.status && statusStr !== 'all') {
      if (Array.isArray(params.status)) {
        query = query.in('status', params.status);
      } else if (statusStr === 'unqualified' || statusStr === 'invalid') {
        query = query.in('status', ['unqualified', 'invalid']);
      } else if (statusStr === 'follow_up' || statusStr === 'followup') {
        query = query.in('status', ['follow_up', 'followup']);
      } else if (statusStr === 'not_interested' || statusStr === 'notinterested') {
        query = query.in('status', ['not_interested', 'notinterested']);
      } else {
        query = query.eq('status', statusStr);
      }
    }

    if (params.priority) {
      if (Array.isArray(params.priority)) {
        query = query.in('priority', params.priority);
      } else {
        query = query.eq('priority', params.priority);
      }
    }

    if (params.category) {
      query = query.eq('category', params.category);
    }

    if (params.search && params.search.trim().length > 0) {
      const s = params.search.trim();
      query = query.or(
        `business_name.ilike.%${s}%,contact_person.ilike.%${s}%,phone.ilike.%${s}%,email.ilike.%${s}%,city.ilike.%${s}%,category.ilike.%${s}%`
      );
    }

    const sortBy = params.sortBy || 'created_at';
    const ascending = params.sortOrder === 'asc';
    query = query.order(sortBy, { ascending }).range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching leads from Supabase:', error);
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 1,
        hasMore: false,
      };
    }

    const rows = (data || []).map((l: any) => ({
      ...l,
      assigned_rep: assignmentByLeadId.get(l.id) || null,
    }));
    const total = count ?? rows.length;

    return {
      data: rows,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      hasMore: page * pageSize < total,
    };
  } catch (err) {
    console.error('getLeads error:', err);
    return {
      data: [],
      total: 0,
      page,
      pageSize,
      totalPages: 1,
      hasMore: false,
    };
  }
}

export async function getLeadById(id: string): Promise<Lead | null> {
  try {
    const supabase = await getDbClient();
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();
    if (!error && data) return data;
  } catch (err) {
    console.error('getLeadById error:', err);
  }
  return null;
}

export async function getLeadActivities(leadId: string): Promise<LeadActivity[]> {
  try {
    const supabase = await getDbClient();
    const { data, error } = await supabase
      .from('lead_activities')
      .select('*, employee:profiles(id, full_name, employee_id)')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (!error && data) return data as any;
  } catch (err) {
    console.error('getLeadActivities error:', err);
  }
  return [];
}

export async function getLeadRemarks(leadId: string): Promise<LeadRemark[]> {
  try {
    const supabase = await getDbClient();
    const { data, error } = await supabase
      .from('lead_remarks')
      .select('*, employee:profiles(id, full_name, employee_id)')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (!error && data) return data as any;
  } catch (err) {
    console.error('getLeadRemarks error:', err);
  }
  return [];
}

export async function getLeadStatusCounts(employeeId?: string): Promise<LeadStatusCounts> {
  return getCachedOrFetch(`lead_status_counts_${employeeId || 'admin'}`, 12000, async () => {
    const counts: LeadStatusCounts = {
      all: 0,
      unassigned: 0,
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

    try {
      const supabase = await getDbClient();

      const [allLeads, allAssigns, activeProfiles] = await Promise.all([
        fetchAllRows<any>((from, to) =>
          supabase.from('leads').select('id, status').range(from, to)
        ),
        fetchAllRows<any>((from, to) =>
          supabase
            .from('lead_assignments')
            .select('lead_id, employee_id')
            .eq('is_active', true)
            .range(from, to)
        ),
        supabase.from('profiles').select('id').eq('is_active', true),
      ]);

      const activeEmpSet = new Set((activeProfiles.data || []).map((p: any) => p.id));
      const validAssigns = allAssigns.filter((a: any) => activeEmpSet.has(a.employee_id));
      const allAssignedSet = new Set(validAssigns.map((a: any) => a.lead_id));
      counts.unassigned = allLeads.filter(
        (l: any) =>
          !allAssignedSet.has(l.id) &&
          l.status !== 'archived' &&
          l.status !== 'unqualified'
      ).length;

      if (employeeId) {
        const empLeadIds = new Set(
          validAssigns
            .filter((a: any) => a.employee_id === employeeId)
            .map((a: any) => a.lead_id)
        );
        const empLeads = allLeads.filter((l: any) => empLeadIds.has(l.id));
        counts.all = empLeads.length;
        empLeads.forEach((l: any) => {
          const s = (l.status === 'invalid' ? 'unqualified' : l.status) as keyof LeadStatusCounts;
          if (s in counts && s !== 'all' && s !== 'unassigned') {
            counts[s] = (counts[s] || 0) + 1;
          }
        });
        return counts;
      }

      counts.all = allLeads.length;
      allLeads.forEach((l: any) => {
        const s = (l.status === 'invalid' ? 'unqualified' : l.status) as keyof LeadStatusCounts;
        if (s in counts && s !== 'all' && s !== 'unassigned') {
          counts[s] = (counts[s] || 0) + 1;
        }
      });

      return counts;
    } catch (err) {
      console.error('Error fetching lead status counts:', err);
      return counts;
    }
  });
}

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const authClient = await createServerSupabaseClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();
    if (user?.id) return user.id;
  } catch {}
  return null;
}
